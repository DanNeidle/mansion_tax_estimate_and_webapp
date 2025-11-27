#!/usr/bin/env python3

# © Tax Policy Associates 2025

import json
import os

import pandas as pd
import geopandas as gpd
from tqdm import tqdm

# ---------- CONFIG ----------
CTSOP_XLSX = "CTSOP_tables.xlsx"
CTSOP_SHEET = "CTSOP2.0"

# Use the July 2024 boundaries GPKG
BOUNDARIES_FILE = "Westminster_Parliamentary_Constituencies_July_2024_Boundaries_UK_BGC_-753850996617870270.gpkg"

# In almost all ONS PCON 2024 boundary files this is the code field:
#   PCON24CD = constituency code, PCON24NM = name
# If your GPKG differs, just change this constant.
BOUNDARY_CODE_FIELD = "PCON24CD"

OUTPUT_GEOJSON = "constituency_council_tax_bands.geojson"

# postcode inputs/outputs
POSTCODE_TX_CSV = "postcode_sales_by_bracket.csv"
POSTCODE_OUTPUT_GEOJSON = "postcode_sales_by_bracket.geojson"
MANIFEST_OUTPUT = "map_data_manifest.json"

COL_GEOG = "Geography [note 1]"
COL_CODE = "ONS area code [note 3]"
COL_NAME = "ONS area name"

BAND_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]

HOUSE_PRICE_XLSX = "housepricestatisticsparlicon.xlsx"
HOUSE_PRICE_SHEET = "2a"
HOUSE_PRICE_HEADER_ROW = 2  # zero-indexed header row
HOUSE_PRICE_CODE_COL = "Area Code"
HOUSE_PRICE_1995_COL = "Year ending Dec 1995"
HOUSE_PRICE_2025_COL = "Year ending Mar 2025"

RECENT_TX_CSV = "constituency_sales_by_bracket.csv"
# Column labels in the recent transactions CSV
TX_COLS = {
    '£2m - £2.5m': 'tx_2m_to_2_5m_count',
    '£2.5m - £3.5m': 'tx_2_5m_to_3_5m_count',
    '£3.5m - £5m': 'tx_3_5m_to_5m_count',
    '£5m+': 'tx_over_5m_count',
}
# -----------------------------


def load_ctsop_pcon():
    df = pd.read_excel(
        CTSOP_XLSX,
        sheet_name=CTSOP_SHEET,
        header=4  # A5 is the header row
    )

    df_pcon = df[df[COL_GEOG] == "PCON"].copy()

    cols_to_keep = [COL_CODE, COL_NAME] + BAND_COLUMNS
    df_pcon = df_pcon[cols_to_keep].copy()

    df_pcon.rename(columns={
        COL_CODE: "pcon_code",
        COL_NAME: "name",
    }, inplace=True)

    band_rename = {b: f"band_{b}" for b in BAND_COLUMNS}
    df_pcon.rename(columns=band_rename, inplace=True)

    df_pcon["pcon_code"] = df_pcon["pcon_code"].astype(str).str.strip()
    df_pcon = df_pcon[df_pcon["pcon_code"].str.startswith("E")]

    return df_pcon


def load_house_prices():
    df_prices = pd.read_excel(
        HOUSE_PRICE_XLSX,
        sheet_name=HOUSE_PRICE_SHEET,
        header=HOUSE_PRICE_HEADER_ROW
    )

    cols = [
        HOUSE_PRICE_CODE_COL,
        HOUSE_PRICE_1995_COL,
        HOUSE_PRICE_2025_COL,
    ]
    df_prices = df_prices[cols].copy()

    df_prices.rename(columns={
        HOUSE_PRICE_CODE_COL: "pcon_code",
        HOUSE_PRICE_1995_COL: "median_price_1995",
        HOUSE_PRICE_2025_COL: "median_price_2025",
    }, inplace=True)

    df_prices["pcon_code"] = df_prices["pcon_code"].astype(str).str.strip()

    df_prices["median_price_1995"] = pd.to_numeric(
        df_prices["median_price_1995"], errors="coerce"
    )
    df_prices["median_price_2025"] = pd.to_numeric(
        df_prices["median_price_2025"], errors="coerce"
    )

    base = df_prices["median_price_1995"]
    df_prices["median_price_change_pct"] = (
        (df_prices["median_price_2025"] - base) / base * 100
    )
    df_prices.loc[base <= 0, "median_price_change_pct"] = pd.NA

    return df_prices


def load_recent_transactions():
    df_tx = pd.read_csv(RECENT_TX_CSV)

    if "pcon" not in df_tx.columns:
        raise RuntimeError("Recent transactions CSV missing 'pcon' column")

    # Check for the  expected columns
    expected_cols = list(TX_COLS.keys())
    missing_cols = [col for col in expected_cols if col not in df_tx.columns]
    if missing_cols:
        # Provide a more informative error message
        raise RuntimeError(
            f"Recent transactions CSV is missing expected columns: {missing_cols}. "
            f"Found columns: {list(df_tx.columns)}"
        )

    df_tx = df_tx[["pcon"] + expected_cols].copy()
    df_tx.rename(columns={"pcon": "pcon_code", **TX_COLS}, inplace=True)

    for col in TX_COLS.values():
        df_tx[col] = pd.to_numeric(df_tx[col], errors="coerce").fillna(0).astype(int)

    # Calculate the "over £2m" metric
    df_tx["tx_2m_plus_count"] = (
        df_tx["tx_2m_to_2_5m_count"]
        + df_tx["tx_2_5m_to_3_5m_count"]
        + df_tx["tx_3_5m_to_5m_count"]
        + df_tx["tx_over_5m_count"]
    )

    return df_tx


def load_postcode_points():
    """
    Load postcode-level transaction data and return a GeoDataFrame of points
    for postcodes with at least one £2m+ property.
    """
    df_pc = pd.read_csv(POSTCODE_TX_CSV)

    required_cols = [
        "postcode_clean",
        "postcode_label",
        "lat",
        "long",
        "£0 - £2m",
        "£2m - £2.5m",
        "£2.5m - £3.5m",
        "£3.5m - £5m",
        "£5m+",
        "Total Sales",
        "rejected_multiple_transactions",
    ]
    missing = [c for c in required_cols if c not in df_pc.columns]
    if missing:
        raise RuntimeError(
            f"Postcode transactions CSV is missing expected columns: {missing}. "
            f"Found columns: {list(df_pc.columns)}"
        )

    # Ensure numeric for bracket/total/rejected columns
    numeric_cols = [
        "£0 - £2m",
        "£2m - £2.5m",
        "£2.5m - £3.5m",
        "£3.5m - £5m",
        "£5m+",
        "Total Sales",
        "rejected_multiple_transactions",
    ]
    for col in numeric_cols:
        df_pc[col] = pd.to_numeric(df_pc[col], errors="coerce").fillna(0).astype(int)

    # Compute number of £2m+ properties per postcode
    high_value_cols = [
        "£2m - £2.5m",
        "£2.5m - £3.5m",
        "£3.5m - £5m",
        "£5m+",
    ]
    df_pc["hv_count"] = df_pc[high_value_cols].sum(axis=1)

    # Keep only postcodes with at least one £2m+ property
    df_pc = df_pc[df_pc["hv_count"] > 0].copy()

    # Drop rows without coordinates
    df_pc = df_pc.dropna(subset=["lat", "long"])
    if df_pc.empty:
        print("Warning: no postcode rows with coordinates and hv_count > 0 found.")
        return gpd.GeoDataFrame(columns=df_pc.columns.tolist() + ["geometry"], crs="EPSG:4326")

    # Build GeoDataFrame of points
    gdf_pc = gpd.GeoDataFrame(
        df_pc,
        geometry=gpd.points_from_xy(df_pc["long"], df_pc["lat"]),
        crs="EPSG:4326",
    )

    return gdf_pc


def build_manifest_entry(path):
    if not path:
        return {"file": "", "bytes": 0, "available": False}
    exists = os.path.exists(path)
    size = os.path.getsize(path) if exists else 0
    return {
        "file": path,
        "bytes": int(size),
        "available": bool(exists),
    }


def write_data_manifest(constituency_path, postcode_path):
    manifest = {
        "datasets": {
            "constituency": build_manifest_entry(constituency_path),
            "postcode": build_manifest_entry(postcode_path),
        }
    }
    with open(MANIFEST_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Data manifest written to {MANIFEST_OUTPUT}")


def main():
    steps = [
        "Loading CTSOP data",
        "Loading house price data",
        "Merging house prices",
        "Loading recent transactions",
        "Merging recent transactions",
        "Loading constituency boundaries",
        "Merging boundaries",
        "Writing constituency GeoJSON",
        "Loading postcode transactions",
        "Writing postcode GeoJSON",
    ]

    with tqdm(total=len(steps), desc="Processing data") as pbar:
        # ---- Constituency data pipeline ----
        pbar.set_description(steps[0])
        df_pcon = load_ctsop_pcon()
        pbar.update(1)

        pbar.set_description(steps[1])
        house_prices = load_house_prices()
        pbar.update(1)

        pbar.set_description(steps[2])
        df_pcon = df_pcon.merge(house_prices, on="pcon_code", how="left")
        pbar.update(1)

        pbar.set_description(steps[3])
        recent_tx = load_recent_transactions()
        pbar.update(1)

        pbar.set_description(steps[4])
        df_pcon = df_pcon.merge(recent_tx, on="pcon_code", how="left")
        pbar.update(1)

        pbar.set_description(steps[5])
        gdf = gpd.read_file(BOUNDARIES_FILE)
        pbar.update(1)

        if BOUNDARY_CODE_FIELD not in gdf.columns:
            raise RuntimeError(
                f"Boundary code field '{BOUNDARY_CODE_FIELD}' not found. "
                f"Available columns: {list(gdf.columns)}"
            )

        if gdf.crs is not None:
            if gdf.crs.to_epsg() != 4326:
                gdf = gdf.to_crs(epsg=4326)
        else:
            print("Warning: boundary CRS is None; set it manually if needed.")

        gdf["pcon_code"] = gdf[BOUNDARY_CODE_FIELD].astype(str).str.strip()
        df_pcon["pcon_code"] = df_pcon["pcon_code"].astype(str).str.strip()
        gdf = gdf[gdf["pcon_code"].str.startswith("E")]

        pbar.set_description(steps[6])
        merged = gdf.merge(df_pcon, on="pcon_code", how="left")
        pbar.update(1)

        missing = merged[merged["band_F"].isna()]
        if not missing.empty:
            print(
                f"Warning: {len(missing)} constituencies missing CTSOP band data."
            )

        desired_prop_cols = [
            "pcon_code",
            "name",
            # Council Tax bands
            "band_A", "band_B", "band_C", "band_D", "band_E",
            "band_F", "band_G", "band_H", "band_I",
            # Median prices
            "median_price_1995",
            "median_price_2025",
            "median_price_change_pct",
            # transaction counts
            "tx_2m_to_2_5m_count",
            "tx_2_5m_to_3_5m_count",
            "tx_3_5m_to_5m_count",
            "tx_over_5m_count",
            "tx_2m_plus_count",  # total for mansion tax
        ]
        desired_prop_cols = [c for c in desired_prop_cols if c in merged.columns]

        merged = merged[desired_prop_cols + ["geometry"]]

        pbar.set_description(steps[7])
        merged.to_file(OUTPUT_GEOJSON, driver="GeoJSON")
        pbar.update(1)

        # ---- Postcode point layer ----
        pbar.set_description(steps[8])
        postcode_gdf = load_postcode_points()
        pbar.update(1)

        pbar.set_description(steps[9])
        if not postcode_gdf.empty:
            try:
                english_bounds = merged[["pcon_code", "geometry"]].dropna(subset=["geometry"]).copy()
                english_bounds = english_bounds.reset_index(drop=True)
                english_bounds = gpd.GeoDataFrame(english_bounds, geometry="geometry", crs=merged.crs)
                joined = gpd.sjoin(postcode_gdf, english_bounds, how="inner", predicate="within")
                postcode_gdf = joined.drop(columns=[col for col in ["index_right"] if col in joined.columns])
            except Exception as exc:
                print(f"Warning: failed to spatially filter postcode data to England: {exc}")
            if not postcode_gdf.empty:
                postcode_gdf.to_file(POSTCODE_OUTPUT_GEOJSON, driver="GeoJSON")
                print(f"Postcode GeoJSON written to {POSTCODE_OUTPUT_GEOJSON}")
            else:
                print("No postcode GeoJSON written (no postcode data after filtering).")
        else:
            print("No postcode GeoJSON written (no postcode data).")
        pbar.update(1)

        write_data_manifest(OUTPUT_GEOJSON, POSTCODE_OUTPUT_GEOJSON)

    print("Done.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import json
from pathlib import Path
import pandas as pd

INPUT_FILE = Path("constituency_sales_by_bracket.csv")
OUTPUT_FILE = Path("mansion_tax_treemap.json")

MAX_TO_PLOT = 300

# A subtle, professional palette (Blues/Teals/Greys)
# "Nice" rather than "Garish"
PALETTE = [
    "#2c3e50", # Dark Slate
    "#34495e", # Slate
    "#5d6d7e", # Muted Blue Grey
    "#85929e", # Light Grey Blue
    "#2874a6", # Professional Blue
    "#3498db", # Bright Blue (Subtle)
    "#5dade2", # Sky Blue
    "#1abc9c", # Muted Teal
    "#16a085", # Darker Teal
    "#2e4053", # Deep Navy
]

def main():
    if not INPUT_FILE.exists():
        print(f"File {INPUT_FILE} not found.")
        return

    # Read constituency name and mansion tax estimate from CSV, convert to £m
    df = pd.read_csv(INPUT_FILE, usecols=["Constituency Name", "Mansion Tax Estimate"])

    if len(df.columns) < 2:
        print("Error: Could not find expected columns in constituency_sales_by_bracket.csv")
        return

    df.columns = ["name", "value"]

    # Clean data
    # Force numeric, convert to millions, coerce errors to NaN, then fill with 0
    # Also round to one decimal as requested: e.g. 3.5
    df["value"] = (pd.to_numeric(df["value"], errors="coerce").fillna(0) / 1e6).round(1)
    df["name"] = df["name"].astype(str).str.strip()

    # Sort descending
    df = df.sort_values(by="value", ascending=False)

    # Split into Top X and Rest
    top_df = df.head(MAX_TO_PLOT).copy()
    rest_df = df.iloc[MAX_TO_PLOT:]

    # Build the data list for ECharts
    treemap_data = []

    # 1. Add Top Items
    for i, row in top_df.iterrows():
        val = row["value"]
        if val <= 0: continue
        
        treemap_data.append({
            "name": row["name"],
            "value": val,
            "itemStyle": {
                "color": PALETTE[i % len(PALETTE)] # type: ignore
            }
        })

    # 2. Add "Other" category if there is remaining data
    if not rest_df.empty:
        other_total = rest_df["value"].sum()
        if other_total > 0:
            treemap_data.append({
                "name": f"Other ({len(rest_df)} constituencies)",
                "value": round(other_total, 1),
                "itemStyle": {
                    "color": "#999999" # Grey for 'Other'
                }
            })

    option = {
        "title": {
            "text": "Estimated mansion tax liability by constituency",
            "left": "center",
            "top": 10,
            "textStyle": {"fontSize": 16}
        },
        # Custom tooltip formatting for the plugin
        # Use {y} because the plugin's getDim(1) returns p.value for scalar values
        "_tpaTooltip": {
            "template": "{name}<br>£{y:0.0}m"
        },
        "tooltip": {
            "trigger": "item"
        },
        "series": [
            {
                "type": "treemap",
                "width": "95%",
                "height": "85%",
                "top": 60,
                "roam": False,
                "nodeClick": False,
                "breadcrumb": {"show": False},
                "label": {
                    "show": True,
                    "formatter": "{b}\n£{c}m",
                    "fontSize": 11,
                    # Ensure text is readable against various background colors
                    "textShadowColor": "rgba(0,0,0,0.5)",
                    "textShadowBlur": 2,
                    "color": "#fff"
                },
                "itemStyle": {
                    "borderColor": "#fff",
                    "borderWidth": 1,
                    "gapWidth": 1
                },
                "data": treemap_data
            }
        ]
    }

    OUTPUT_FILE.write_text(json.dumps(option, indent=2), encoding="utf-8")
    print(f"Treemap JSON written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

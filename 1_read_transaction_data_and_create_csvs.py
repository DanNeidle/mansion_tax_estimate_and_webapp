# © Tax Policy Associates 2025

import pandas as pd
import numpy as np
import os
from tqdm import tqdm
 
# ==========================================
# CONFIGURATION
# ==========================================
# Input files
PPD_FILES = [
    'pp-complete.csv',
]
NSPL_FILE = 'NSPL_FEB_2025_UK.csv'
HOUSE_PRICE_XLSX = "housepricestatisticsparlicon.xlsx"

# Sheets and rows for house price data
HOUSE_PRICE_SHEET = "2a"
HOUSE_PRICE_HEADER_ROW = 2  # zero-indexed header row

# Output files
OUTPUT_FILE = 'constituency_sales_by_bracket.csv'
POSTCODE_OUTPUT_FILE = 'postcode_sales_by_bracket.csv'

# Define Price Brackets (Upper bounds)
# The bins will be: 0-2m, 2m-2.5m, 2.5m-3.5m, 3.5m-5m, 5m+
BRACKETS = [0, 2_000_000, 2_500_000, 3_500_000, 5_000_000, float('inf')]
LABELS = ['£0 - £2m', '£2m - £2.5m', '£2.5m - £3.5m', '£3.5m - £5m', '£5m+']


def load_and_prepare_inflation_data():
    """
    Loads the wide-format house price time series data and transforms it
    into a long-format DataFrame for easy lookups.
    """
    print("Loading and preparing house price inflation data...")
    df = pd.read_excel(
        HOUSE_PRICE_XLSX,
        sheet_name=HOUSE_PRICE_SHEET,
        header=HOUSE_PRICE_HEADER_ROW
    )
    df.rename(columns={'Area Code': 'pcon', 'Area Name': 'name'}, inplace=True)
    
    # Get all columns that represent dates
    date_cols = [col for col in df.columns if 'Year ending' in str(col)]
    
    # Unpivot the dataframe
    id_vars = ['pcon', 'name']
    df_long = pd.melt(df, id_vars=id_vars, value_vars=date_cols, var_name='Quarter', value_name='MedianPrice')
    
    # --- Parse the 'Quarter' strings into dates ---
    # Simplified parsing logic
    def parse_quarter_string(q_str):
        parts = q_str.split(' ')
        year = int(parts[-1])
        month_str = parts[-2]
        
        month_map = {'Mar': 3, 'Jun': 6, 'Sep': 9, 'Dec': 12}
        month = month_map.get(month_str, 12)  # Default to Dec if error
        
        return pd.Timestamp(year, month, 1) + pd.offsets.MonthEnd(0)

    df_long['QuarterEnd'] = df_long['Quarter'].apply(parse_quarter_string)
    df_long.drop(columns=['Quarter'], inplace=True)

    # Convert prices to numeric, coercing errors
    df_long['MedianPrice'] = pd.to_numeric(df_long['MedianPrice'], errors='coerce')
    df_long.dropna(subset=['pcon', 'MedianPrice'], inplace=True)

    print(f"  > Prepared {len(df_long):,} quarterly median price records.")
    return df_long


def main():
    steps = [
        "Loading Inflation Data",
        "Loading Price Paid Data",
        "Deduplicating Transactions",
        "Loading NSPL Data",
        "Merging & Uprating",
        "Categorizing Prices",
        "Aggregating Data",
        "Exporting CSV",
        "Performing Data-Range Checks"
    ]

    discarded_other_transactions = 0

    with tqdm(total=len(steps), desc="Overall Progress") as pbar:
        # ---------------------------------------------------------
        # 1. LOAD INFLATION DATA
        # ---------------------------------------------------------
        pbar.set_description(steps[0])
        df_inflation = load_and_prepare_inflation_data()
        
        # Get latest prices for uprating
        latest_quarter_date = df_inflation['QuarterEnd'].max()
        print(f"  > Latest inflation data is for quarter ending {latest_quarter_date.strftime('%Y-%m-%d')}")
        df_latest_prices = df_inflation[df_inflation['QuarterEnd'] == latest_quarter_date]
        latest_price_lookup = df_latest_prices.set_index('pcon')['MedianPrice']
        pbar.update(1)

        # ---------------------------------------------------------
        # 2. LOAD LAND REGISTRY DATA
        # ---------------------------------------------------------
        pbar.set_description(steps[1])
        print("\nLoading Price Paid Data...")
        ppd_frames = []
        chunksize = 1_000_000

        ppd_file = PPD_FILES[0]

        try:
            print(f"  > Counting rows in {ppd_file}...")
            with open(ppd_file, 'r', encoding='latin1') as f:
                total_lines = sum(1 for row in f)
            
            print(f"  > Reading {total_lines:,} rows from {ppd_file} in chunks of {chunksize:,}...")

            reader = pd.read_csv(
                ppd_file,
                header=None,
                usecols=[1, 2, 3, 4, 7, 8],
                names=['Price', 'Date', 'Postcode', 'PropertyType', 'PAON', 'SAON'],
                dtype={
                    'Price': 'int64',
                    'Postcode': 'str',
                    'Date': 'str',
                    'PropertyType': 'str',
                    'PAON': 'str',
                    'SAON': 'str'
                },
                chunksize=chunksize,
                encoding='latin1'
            )

            for chunk in tqdm(reader, total=(total_lines // chunksize) + 1, unit=" chunks", desc="Reading CSV"):
                ppd_frames.append(chunk)

        except FileNotFoundError:
            print(f"Error: Could not find {ppd_file}")
            return
        
        print("  > Concatenating data chunks...")
        df_ppd = pd.concat(ppd_frames, ignore_index=True)

        print("  > Parsing dates...")
        df_ppd['Date'] = pd.to_datetime(df_ppd['Date'], errors='coerce')

        print("  > Filtering residential property types...")
        df_ppd['PropertyType'] = df_ppd['PropertyType'].fillna('').str.upper().str.strip()
        other_mask = df_ppd['PropertyType'] == 'O'
        discarded_other_transactions = int(other_mask.sum())
        if discarded_other_transactions:
            print(f"    > Discarding {discarded_other_transactions:,} 'Other' property transactions.")
        df_ppd = df_ppd[~other_mask].copy()
        
        print(f"  > Loaded {len(df_ppd):,} total transactions.")
        pbar.update(1)

        # ---------------------------------------------------------
        # 3. DEDUPLICATE TRANSACTIONS
        # ---------------------------------------------------------
        pbar.set_description(steps[2])
        print("\nFinding most recent transaction for each property...")
        
        df_ppd.dropna(subset=['Date'], inplace=True)  # Drop rows that can't be sorted
        df_ppd['PAON'] = df_ppd['PAON'].fillna('')
        df_ppd['SAON'] = df_ppd['SAON'].fillna('')
        df_ppd['Postcode'] = df_ppd['Postcode'].fillna('')

        df_ppd['Property_ID'] = (
            df_ppd['Postcode'].str.strip() + ' | ' +
            df_ppd['PAON'].str.strip() + ' | ' +
            df_ppd['SAON'].str.strip()
        )

        df_ppd.sort_values('Date', ascending=False, inplace=True)
        # Keep only the first occurrence of each property
        df_ppd_unique = df_ppd.drop_duplicates(subset=['Property_ID'], keep='first').copy()
        
        print(f"  > Kept {len(df_ppd_unique):,} unique property transactions.")
        print(f"  > Rejected {len(df_ppd) - len(df_ppd_unique):,} older transactions.")
        
        df_all_transactions = df_ppd
        df_ppd = df_ppd_unique
        pbar.update(1)

        # ---------------------------------------------------------
        # 4. LOAD NSPL DATA (Lookup)
        # ---------------------------------------------------------
        pbar.set_description(steps[3])
        print(f"\nLoading NSPL Geography Data from {NSPL_FILE}...")
        try:
            df_nspl = pd.read_csv(
                NSPL_FILE,
                usecols=['pcds', 'pcon', 'lat', 'long'],
                dtype={'pcds': 'str', 'pcon': 'str'},
                low_memory=False
            )
        except ValueError:
            df_nspl = pd.read_csv(
                NSPL_FILE,
                usecols=['pcd', 'pcon', 'lat', 'long'],
                dtype={'pcd': 'str', 'pcon': 'str'},
                low_memory=False
            ).rename(columns={'pcd': 'pcds'})

        df_nspl['Postcode_Clean'] = df_nspl['pcds'].str.upper().str.replace(' ', '')
        df_nspl.dropna(subset=['pcon'], inplace=True)
        df_nspl.drop_duplicates(subset=['Postcode_Clean'], inplace=True)
        print(f"  > Loaded {len(df_nspl):,} postcodes with constituency data.")
        pbar.update(1)

        # ---------------------------------------------------------
        # 5. MERGE DATASETS & UPRATE PRICES
        # ---------------------------------------------------------
        pbar.set_description(steps[4])
        print("\nMerging Transactions with Constituencies and Uprating Prices...")

        df_ppd['Postcode_Clean'] = df_ppd['Postcode'].str.upper().str.replace(' ', '')
        df_all_transactions['Postcode_Clean'] = df_all_transactions['Postcode'].str.upper().str.replace(' ', '')
        
        merged_df = pd.merge(
            df_ppd,
            df_nspl[['Postcode_Clean', 'pcon']],
            on='Postcode_Clean',
            how='left'
        )
        merged_all_df = pd.merge(
            df_all_transactions,
            df_nspl[['Postcode_Clean', 'pcon']],
            on='Postcode_Clean',
            how='left'
        )

        merged_df.dropna(subset=['pcon'], inplace=True)
        merged_all_df.dropna(subset=['pcon'], inplace=True)
        print(f"  > Matched {len(merged_df):,} unique transactions to a constituency.")
        
        # Constituency-level rejected multiples
        total_counts = merged_all_df.groupby('pcon').size().rename("total_sales")
        unique_counts = merged_df.groupby('pcon').size().rename("unique_sales")
        rejections_df = pd.concat([total_counts, unique_counts], axis=1).fillna(0)
        rejections_df['rejected_multiple_transactions'] = (
            rejections_df['total_sales'] - rejections_df['unique_sales']
        )
        print(f"  > Calculated rejected transaction counts per constituency.")

        # --- Uprating Logic ---
        print("  > Uprating historical transaction prices...")
        # Normalize the quarter-end date to midnight to ensure it matches the inflation data's timestamps
        merged_df['QuarterEnd'] = (merged_df['Date'].dt.to_period('Q').dt.end_time).dt.normalize()
        
        # Merge historical prices
        merged_df = pd.merge(
            merged_df,
            df_inflation,
            on=['pcon', 'QuarterEnd'],
            how='left'
        )
        merged_df.rename(columns={'MedianPrice': 'MedianPrice_historical'}, inplace=True)

        # Add a diagnostic check
        historical_matches = merged_df['MedianPrice_historical'].notna().sum()
        print(f"  > Matched {historical_matches:,} transactions to a historical median price.")

        # Map latest prices
        merged_df['MedianPrice_latest'] = merged_df['pcon'].map(latest_price_lookup)
        
        # Calculate inflation factor
        merged_df['inflation_factor'] = merged_df['MedianPrice_latest'] / merged_df['MedianPrice_historical']
        # Fill NaNs with 1 (i.e., no change) for transactions that couldn't be uprated
        merged_df['inflation_factor'] = merged_df['inflation_factor'].fillna(1)


        # Calculate Uprated Price
        merged_df['Uprated_Price'] = merged_df['Price'] * merged_df['inflation_factor']

        uprated_count = (merged_df['inflation_factor'] != 1).sum()
        print(f"  > Successfully uprated {uprated_count:,} of {len(merged_df):,} transactions.")
        pbar.update(1)

        # ---------------------------------------------------------
        # 6. CATEGORIZE PRICES
        # ---------------------------------------------------------
        pbar.set_description(steps[5])
        print("\nCategorizing uprated prices into brackets...")
        merged_df['Price_Bracket'] = pd.cut(
            merged_df['Uprated_Price'],
            bins=BRACKETS,
            labels=LABELS,
            right=False
        )
        pbar.update(1)

        # ---------------------------------------------------------
        # 7. AGGREGATE (CONSTITUENCY + POSTCODE)
        # ---------------------------------------------------------
        pbar.set_description(steps[6])
        print("\nAggregating data...")

        # Constituency-level crosstab
        constituency_table = pd.crosstab(
            merged_df['pcon'],
            merged_df['Price_Bracket']
        )

        # Postcode-level crosstab (based on cleaned unit postcodes)
        postcode_table = pd.crosstab(
            merged_df['Postcode_Clean'],
            merged_df['Price_Bracket']
        )

        pbar.update(1)

        # ---------------------------------------------------------
        # 8. EXPORT
        # ---------------------------------------------------------
        pbar.set_description(steps[7])

        # ---- Constituency CSV (existing behaviour) ----
        print(f"\nSaving constituency results to {OUTPUT_FILE}...")
        
        output_table = constituency_table.copy()
        output_table['Total Sales'] = output_table.sum(axis=1)
        output_table = output_table.join(
            rejections_df[['rejected_multiple_transactions']],
            how='left'
        )
        output_table['rejected_multiple_transactions'] = (
            output_table['rejected_multiple_transactions']
            .fillna(0)
            .astype(int)
        )

        if '£5m+' in output_table.columns:
            output_table.sort_values(by='£5m+', ascending=False, inplace=True)
        
        output_table.to_csv(OUTPUT_FILE)
        print("Done!")
        print("\nTop 5 Constituencies by £5m+ Sales (Codes):")
        print(output_table.head(5)[['£5m+', 'Total Sales', 'rejected_multiple_transactions']])

        # ---- Postcode CSV  ----
        print(f"\nSaving postcode-level results to {POSTCODE_OUTPUT_FILE}...")

        # Rejected multiples per postcode
        total_counts_pc = merged_all_df.groupby('Postcode_Clean').size().rename("total_sales")
        unique_counts_pc = merged_df.groupby('Postcode_Clean').size().rename("unique_sales")
        rejections_pc = pd.concat([total_counts_pc, unique_counts_pc], axis=1).fillna(0)
        rejections_pc['rejected_multiple_transactions'] = (
            rejections_pc['total_sales'] - rejections_pc['unique_sales']
        )

        postcode_output = postcode_table.copy()
        postcode_output['Total Sales'] = postcode_output.sum(axis=1)
        postcode_output = postcode_output.join(
            rejections_pc[['rejected_multiple_transactions']],
            how='left'
        )
        postcode_output['rejected_multiple_transactions'] = (
            postcode_output['rejected_multiple_transactions']
            .fillna(0)
            .astype(int)
        )

        # Join NSPL label + coords
        nspl_postcode_cols = ['Postcode_Clean', 'pcds']
        coord_cols = []
        if 'lat' in df_nspl.columns:
            coord_cols.append('lat')
        if 'long' in df_nspl.columns:
            coord_cols.append('long')
        nspl_postcode_cols.extend(coord_cols)

        df_nspl_postcode = df_nspl[nspl_postcode_cols].copy()

        # Move index to a column for merge
        postcode_output = postcode_output.reset_index().rename(columns={'Postcode_Clean': 'postcode_clean'})

        postcode_output = postcode_output.merge(
            df_nspl_postcode.rename(columns={'Postcode_Clean': 'postcode_clean'}),
            on='postcode_clean',
            how='left'
        )

        # Rename label column
        postcode_output.rename(columns={'pcds': 'postcode_label'}, inplace=True)

        # Ensure column ordering:
        band_cols = LABELS[:]  # same labels as constituency
        col_order = ['postcode_clean', 'postcode_label']
        if 'lat' in postcode_output.columns:
            col_order.append('lat')
        if 'long' in postcode_output.columns:
            col_order.append('long')
        col_order += band_cols + ['Total Sales', 'rejected_multiple_transactions']

        # Only keep columns that actually exist (defensive)
        col_order = [c for c in col_order if c in postcode_output.columns]
        postcode_output = postcode_output[col_order]

        postcode_output.to_csv(POSTCODE_OUTPUT_FILE, index=False)
        print("Postcode-level CSV written.")
        pbar.update(1)

        # ---------------------------------------------------------
        # 9. DATA RANGE CHECK
        # ---------------------------------------------------------
        pbar.set_description(steps[8])
        min_date = df_ppd['Date'].min()
        max_date = df_ppd['Date'].max()
        print(f"\n--- Data Validity Check ---")
        print(f"Earliest Transaction Date Used: {min_date.strftime('%Y-%m-%d')}")
        print(f"Latest Transaction Date Used:   {max_date.strftime('%Y-%m-%d')}")
        print(f"Total 'Other' property transactions discarded: {discarded_other_transactions:,}")
        pbar.update(1)


if __name__ == "__main__":
    main()

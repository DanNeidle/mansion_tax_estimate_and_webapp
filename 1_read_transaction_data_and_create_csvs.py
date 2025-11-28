# © Tax Policy Associates 2025

import pandas as pd
import numpy as np
import os
import re
from tqdm import tqdm

# ==========================================
# CONFIGURATION
# ==========================================
PPD_FILES = ['pp-complete.csv']
NSPL_FILE = 'NSPL_FEB_2025_UK.csv'
HOUSE_PRICE_XLSX = "housepricestatisticsparlicon.xlsx"

# Sheets and rows for house price data
HOUSE_PRICE_SHEET = "2b" # Updated to 2a based on common format, change to 2b if required
HOUSE_PRICE_HEADER_ROW = 2 

OUTPUT_FILE = 'constituency_sales_by_bracket.csv'
POSTCODE_OUTPUT_FILE = 'postcode_sales_by_bracket.csv'
CTSOP_FILE = 'CTSOP_tables.xlsx'
CTSOP_SHEET = 'CTSOP2.0'
CTSOP_SKIPROWS = 7

BRACKETS = [0, 2_000_000, 2_500_000, 3_500_000, 5_000_000, float('inf')]
LABELS = ['£0 - £2m', '£2m - £2.5m', '£2.5m - £3.5m', '£3.5m - £5m', '£5m+']

def clean_addr_col(series):
    """
    Standardizes address strings: Upper case, removes special chars/spaces.
    """
    return (series.fillna('')
            .astype(str)
            .str.upper()
            .str.replace(r'[^A-Z0-9]', '', regex=True))

def load_and_prepare_inflation_data():
    print("Loading and preparing house price inflation data...")
    df = pd.read_excel(HOUSE_PRICE_XLSX, sheet_name=HOUSE_PRICE_SHEET, header=HOUSE_PRICE_HEADER_ROW)
    df.rename(columns={'Area Code': 'pcon', 'Area Name': 'name'}, inplace=True)
    
    date_cols = [col for col in df.columns if 'Year ending' in str(col)]
    id_vars = ['pcon', 'name']
    df_long = pd.melt(df, id_vars=id_vars, value_vars=date_cols, var_name='Quarter', value_name='MedianPrice')
    
    def parse_quarter_string(q_str):
        parts = q_str.split(' ')
        year = int(parts[-1])
        month_str = parts[-2]
        month_map = {'Mar': 3, 'Jun': 6, 'Sep': 9, 'Dec': 12}
        month = month_map.get(month_str, 12)
        return pd.Timestamp(year, month, 1) + pd.offsets.MonthEnd(0)

    df_long['QuarterEnd'] = df_long['Quarter'].apply(parse_quarter_string)
    df_long.drop(columns=['Quarter'], inplace=True)
    df_long['MedianPrice'] = pd.to_numeric(df_long['MedianPrice'], errors='coerce')
    df_long.dropna(subset=['pcon', 'MedianPrice'], inplace=True)
    return df_long

def load_constituency_lookup():
    """
    Returns a Series mapping constituency codes to their names.
    """
    df_lookup = pd.read_excel(
        CTSOP_FILE,
        sheet_name=CTSOP_SHEET,
        usecols='C:D',
        skiprows=CTSOP_SKIPROWS,
        header=None,
        names=['pcon', 'Constituency Name']
    )
    df_lookup.dropna(subset=['pcon'], inplace=True)
    df_lookup['pcon'] = df_lookup['pcon'].astype(str).str.strip()
    df_lookup['Constituency Name'] = df_lookup['Constituency Name'].astype(str).str.strip()
    df_lookup.drop_duplicates(subset=['pcon'], inplace=True)
    return df_lookup.set_index('pcon')['Constituency Name']

def main():
    steps = [
        "Loading Inflation Data",
        "Loading Price Paid Data",
        "Fixing Portfolio/Batch Sales",  # <--- NEW STEP
        "Deduplicating Transactions",
        "Loading NSPL Data",
        "Merging & Uprating",
        "Categorizing Prices",
        "Aggregating Data",
        "Exporting CSV"
    ]

    rejected_counts = pd.Series(dtype='int64')
    postcode_table = pd.DataFrame()

    with tqdm(total=len(steps), desc="Overall Progress") as pbar:
        # 1. LOAD INFLATION
        pbar.set_description(steps[0])
        df_inflation = load_and_prepare_inflation_data()
        latest_quarter_date = df_inflation['QuarterEnd'].max()
        df_latest_prices = df_inflation[df_inflation['QuarterEnd'] == latest_quarter_date]
        latest_price_lookup = df_latest_prices.set_index('pcon')['MedianPrice']
        try:
            constituency_lookup = load_constituency_lookup()
        except FileNotFoundError:
            print(f"Warning: Could not find {CTSOP_FILE}. Constituency names will be left blank.")
            constituency_lookup = pd.Series(dtype='object')
        pbar.update(1)

        # 2. LOAD PPD
        pbar.set_description(steps[1])
        print("\nLoading Price Paid Data...")
        ppd_frames = []
        chunksize = 1_000_000
        ppd_file = PPD_FILES[0]

        try:
            reader = pd.read_csv(
                ppd_file, header=None,
                usecols=[1, 2, 3, 4, 7, 8],
                names=['Price', 'Date', 'Postcode', 'PropertyType', 'PAON', 'SAON'],
                dtype={'Price': 'int64', 'Postcode': 'str', 'PropertyType': 'str', 'PAON': 'str', 'SAON': 'str'},
                chunksize=chunksize, encoding='latin1'
            )
            for chunk in tqdm(reader, desc="Reading CSV", unit=" chunks"):
                ppd_frames.append(chunk)
            df_ppd = pd.concat(ppd_frames, ignore_index=True)
        except FileNotFoundError:
            print(f"Error: Could not find {ppd_file}")
            return

        df_ppd['Date'] = pd.to_datetime(df_ppd['Date'], errors='coerce')
        df_ppd = df_ppd[df_ppd['PropertyType'] != 'O'].copy() # Simple filter
        pbar.update(1)

        # ---------------------------------------------------------
        # 3a. FIX PORTFOLIO/BATCH TRANSACTIONS (NEW BLOCK)
        # ---------------------------------------------------------
        pbar.set_description(steps[2])
        print("\nChecking for Portfolio/Batch sale anomalies...")
        
        # We need a clean postcode to group by, but we haven't done the main cleaning yet.
        # Let's create a temporary clean postcode for this specific check.
        df_ppd['temp_pc'] = clean_addr_col(df_ppd['Postcode'])
        
        # Group by: Postcode, Date, Price
        # This identifies rows that look suspicious (Same location, same day, same price)
        group_cols = ['temp_pc', 'Date', 'Price']
        
        # Calculate how many transactions share these details
        df_ppd['batch_count'] = df_ppd.groupby(group_cols)['Price'].transform('count')
        
        # Identify rows that need fixing (count > 1)
        mask_batch = df_ppd['batch_count'] > 1
        
        # STATS TRACKING
        affected_rows = mask_batch.sum()
        original_value_sum = df_ppd.loc[mask_batch, 'Price'].sum()
        
        # APPLY THE FIX: Divide Price by the Count
        df_ppd.loc[mask_batch, 'Price'] = df_ppd.loc[mask_batch, 'Price'] / df_ppd.loc[mask_batch, 'batch_count']
        
        fixed_value_sum = df_ppd.loc[mask_batch, 'Price'].sum()
        
        print(f"  > Found {affected_rows:,} transactions that were part of batch sales.")
        print(f"  > Corrected total value from £{original_value_sum/1e9:.2f}bn to £{fixed_value_sum/1e9:.2f}bn.")
        print(f"  > (Removed £{(original_value_sum - fixed_value_sum)/1e9:.2f}bn of phantom value)")
        
        # Clean up
        df_ppd.drop(columns=['temp_pc', 'batch_count'], inplace=True)
        pbar.update(1)

        # ---------------------------------------------------------
        # 3b. DEDUPLICATE TRANSACTIONS (STANDARD)
        # ---------------------------------------------------------
        pbar.set_description(steps[3])
        print("\nGenerating unique property keys...")
        
        df_ppd.dropna(subset=['Date'], inplace=True)
        
        # Robust Cleaning
        df_ppd['PAON_clean'] = clean_addr_col(df_ppd['PAON'])
        df_ppd['SAON_clean'] = clean_addr_col(df_ppd['SAON'])
        df_ppd['Postcode_clean'] = clean_addr_col(df_ppd['Postcode'])

        df_ppd['Property_ID'] = (
            df_ppd['Postcode_clean'] + "_" + 
            df_ppd['PAON_clean'] + "_" + 
            df_ppd['SAON_clean']
        )
        
        # Keep clean postcode for later merging
        df_ppd['Postcode_Clean'] = df_ppd['Postcode_clean'] 
        
        # Create a copy for total transaction counts (historical context) before we drop duplicates
        df_all_transactions = df_ppd.copy()

        df_ppd.sort_values('Date', ascending=False, inplace=True)
        df_ppd_unique = df_ppd.drop_duplicates(subset=['Property_ID'], keep='first').copy()
        
        # Free memory
        df_ppd_unique.drop(columns=['PAON_clean', 'SAON_clean', 'Postcode_clean'], inplace=True)
        df_ppd = df_ppd_unique

        pre_dedupe_counts = df_all_transactions.groupby('Postcode_Clean').size()
        post_dedupe_counts = df_ppd.groupby('Postcode_Clean').size()
        rejected_counts = (pre_dedupe_counts - post_dedupe_counts).fillna(0)
        rejected_counts[rejected_counts < 0] = 0
        rejected_counts = rejected_counts.astype(int)
        
        print(f"  > Kept {len(df_ppd):,} unique properties.")
        pbar.update(1)

        # 4. LOAD NSPL
        pbar.set_description(steps[4])
        print(f"\nLoading NSPL...")
        # (Simplified loading for brevity - assumes previous logic)
        try:
             df_nspl = pd.read_csv(NSPL_FILE, usecols=['pcds', 'pcon', 'lat', 'long'], 
                                  dtype={'pcds': 'str', 'pcon': 'str'}, low_memory=False)
        except:
             df_nspl = pd.read_csv(NSPL_FILE, usecols=['pcd', 'pcon', 'lat', 'long'], 
                                  dtype={'pcd': 'str', 'pcon': 'str'}, low_memory=False).rename(columns={'pcd': 'pcds'})
        
        df_nspl['Postcode_Clean'] = clean_addr_col(df_nspl['pcds'])
        df_nspl.drop_duplicates(subset=['Postcode_Clean'], inplace=True)
        pbar.update(1)

        # 5. MERGE & UPRATE
        pbar.set_description(steps[5])
        print("\nMerging and Uprating...")
        
        nspl_merge_cols = ['Postcode_Clean', 'pcon', 'pcds', 'lat', 'long']
        merged_df = pd.merge(df_ppd, df_nspl[nspl_merge_cols], on='Postcode_Clean', how='left')
        merged_df.dropna(subset=['pcon'], inplace=True)
        
        # Prepare Inflation Merge
        merged_df['QuarterEnd'] = (merged_df['Date'].dt.to_period('Q').dt.end_time).dt.normalize()
        
        merged_df = pd.merge(merged_df, df_inflation, on=['pcon', 'QuarterEnd'], how='left')
        merged_df.rename(columns={'MedianPrice': 'MedianPrice_historical'}, inplace=True)
        
        merged_df['MedianPrice_latest'] = merged_df['pcon'].map(latest_price_lookup)
        merged_df['inflation_factor'] = merged_df['MedianPrice_latest'] / merged_df['MedianPrice_historical']
        merged_df['inflation_factor'] = merged_df['inflation_factor'].fillna(1)
        
        # UPRATE
        merged_df['Uprated_Price'] = merged_df['Price'] * merged_df['inflation_factor']
        pbar.update(1)

        # 6. CATEGORIZE
        pbar.set_description(steps[6])
        merged_df['Price_Bracket'] = pd.cut(merged_df['Uprated_Price'], bins=BRACKETS, labels=LABELS, right=False)
        pbar.update(1)

        # 7. AGGREGATE
        pbar.set_description(steps[7])
        constituency_table = pd.crosstab(merged_df['pcon'], merged_df['Price_Bracket'])
        constituency_table['Total Sales'] = constituency_table.sum(axis=1)
        
        if '£5m+' in constituency_table.columns:
            constituency_table.sort_values(by='£5m+', ascending=False, inplace=True)
        
        # Append metadata columns without disturbing existing brackets/total ordering
        constituency_table['Constituency Name'] = constituency_table.index.map(constituency_lookup)

        def get_bracket_counts(label):
            return constituency_table[label] if label in constituency_table.columns else pd.Series(0, index=constituency_table.index)

        constituency_table['Mansion Tax Estimate'] = (
            get_bracket_counts('£2m - £2.5m') * 2_500 +
            get_bracket_counts('£2.5m - £3.5m') * 3_500 +
            get_bracket_counts('£3.5m - £5m') * 5_000 +
            get_bracket_counts('£5m+') * 7_500
        )

        postcode_table = pd.crosstab(merged_df['Postcode_Clean'], merged_df['Price_Bracket'])
        postcode_table['Total Sales'] = postcode_table.sum(axis=1)
        for label in LABELS:
            if label not in postcode_table.columns:
                postcode_table[label] = 0
        postcode_table = postcode_table[LABELS + ['Total Sales']]

        postcode_meta = merged_df.groupby('Postcode_Clean').agg(
            postcode_label=('pcds', 'first'),
            lat=('lat', 'first'),
            long=('long', 'first')
        )
        postcode_table = postcode_table.join(postcode_meta, how='left')
        postcode_table.reset_index(inplace=True)
        postcode_table.rename(columns={'Postcode_Clean': 'postcode_clean'}, inplace=True)
        postcode_table['rejected_multiple_transactions'] = (
            postcode_table['postcode_clean'].map(rejected_counts).fillna(0).astype(int)
        )
        postcode_table['postcode_label'] = postcode_table['postcode_label'].fillna(postcode_table['postcode_clean'])
        postcode_table['lat'] = pd.to_numeric(postcode_table['lat'], errors='coerce')
        postcode_table['long'] = pd.to_numeric(postcode_table['long'], errors='coerce')

        postcode_col_order = ['postcode_clean', 'postcode_label', 'lat', 'long'] + LABELS + ['Total Sales', 'rejected_multiple_transactions']
        postcode_table = postcode_table[postcode_col_order]

        pbar.update(1)

        # 8. EXPORT
        pbar.set_description(steps[8])
        constituency_table.to_csv(OUTPUT_FILE)
        print(f"\nSaved to {OUTPUT_FILE}")
        print("Top 5 Constituencies by £5m+ Sales:")
        print(constituency_table.head(5))
        postcode_table.to_csv(POSTCODE_OUTPUT_FILE, index=False)
        print(f"\nSaved to {POSTCODE_OUTPUT_FILE} with {len(postcode_table):,} postcodes.")
        pbar.update(1)

if __name__ == "__main__":
    main()

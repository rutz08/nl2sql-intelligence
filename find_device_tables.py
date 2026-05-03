import pyodbc
import json

conn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost\\SAMPLE;DATABASE=COSEC;UID=sa;PWD=12345'
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # 1. Find relevant tables
    print("Finding device tables...")
    cursor.execute("SELECT name FROM sys.tables WHERE name LIKE '%Controller%' OR name LIKE '%Device%' OR name LIKE '%Panel%'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Potential tables: {tables}")
    
    # 2. Get columns for Mx_MasterControllerBasicCfg
    print("\nColumns in Mx_MasterControllerBasicCfg:")
    cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_MasterControllerBasicCfg'")
    for row in cursor.fetchall():
        print(row[0])
        
    # 3. Try to find the 'IP' column anywhere
    print("\nSearching for 'IP' column in any table...")
    cursor.execute("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%IP%'")
    for row in cursor.fetchall():
        print(f"{row[0]}: {row[1]}")

    conn.close()
except Exception as e:
    print(f"Error: {e}")

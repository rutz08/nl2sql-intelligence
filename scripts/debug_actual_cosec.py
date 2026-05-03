import pyodbc

conn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost\\SAMPLE;DATABASE=COSEC;UID=sa;PWD=12345'
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("--- Checking Timestamps for Mx_AD_UserMst ---")
    cursor.execute("USE AdminPortalDB")
    cursor.execute("SELECT name, create_date, modify_date FROM sys.objects WHERE name = 'Mx_AD_UserMst'")
    row = cursor.fetchone()
    if row:
        print(f"Table: {row[0]}")
        print(f"Created: {row[1]}")
        print(f"Modified: {row[2]}")
    else:
        print("Table not found in AdminPortalDB.")
        print("No matches found. Checking for ALL tables to find common patterns...")
        cursor.execute("SELECT name FROM sys.tables")
        for row in cursor.fetchall():
            print(f"Table: {row[0]}")
        
    print("\n--- Reading FULL View Definition ---")
    cursor.execute("SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('Mx_VEW_APIDailyAttendance')")
    row = cursor.fetchone()
    if row:
        print(row[0])
    else:
        print("View definition NOT found.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")

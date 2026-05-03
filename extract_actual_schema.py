import pyodbc
import json

conn_str = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost\\SAMPLE;DATABASE=COSEC;UID=sa;PWD=12345'
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    views = ['Mx_VEW_DailyAttendance', 'Mx_VEW_DailyCnteenEvts', 'Mx_VEW_VisitorEntry']
    schema = {}
    
    for view in views:
        print(f"Reading columns for {view}...")
        cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{view}'")
        schema[view] = [row[0] for row in cursor.fetchall()]
        
    print("\n--- ACTUAL SCHEMA DETECTED ---")
    print(json.dumps(schema, indent=4))
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")

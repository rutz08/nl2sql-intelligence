const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost', 
    database: 'COSEC',
    options: {
        encrypt: true, 
        trustServerCertificate: true
    }
};

async function findLeaveTables() {
    try {
        await sql.connect(dbConfig);
        console.log("--- Searching for Tables/Views related to 'Leave' or 'LV' ---");
        const result = await sql.query("SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Leave%' OR TABLE_NAME LIKE '%LV%'");
        console.table(result.recordset);
        
        console.log("\n--- Checking Mx_VEW_MonthlyAtdSumry for Leave Columns ---");
        const cols = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_VEW_MonthlyAtdSumry' AND (COLUMN_NAME LIKE '%Leave%' OR COLUMN_NAME LIKE '%LV%')");
        console.table(cols.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}

findLeaveTables();

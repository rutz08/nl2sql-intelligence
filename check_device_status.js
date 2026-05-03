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

async function checkDeviceStatusSchema() {
    try {
        await sql.connect(dbConfig);
        console.log("--- Checking Mx_VEW_ControllerList Schema ---");
        const res1 = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_VEW_ControllerList'");
        console.table(res1.recordset);

        console.log("\n--- Searching for 'Status' in Device/Controller tables ---");
        const res2 = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Controller%' OR TABLE_NAME LIKE '%Device%'");
        console.table(res2.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}

checkDeviceStatusSchema();

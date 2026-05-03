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

async function getCols() {
    try {
        await sql.connect(dbConfig);
        console.log("--- Columns for Mx_LeaveBal ---");
        const result = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_LeaveBal'");
        console.table(result.recordset);
        
        console.log("\n--- Columns for Mx_LeaveMst ---");
        const res2 = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_LeaveMst'");
        console.table(res2.recordset);

    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}

getCols();

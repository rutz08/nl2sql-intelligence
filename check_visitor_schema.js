const sql = require('mssql');
const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: false
    }
};

async function checkVisitorSchema() {
    try {
        await sql.connect(dbConfig);
        
        console.log("--- Mx_VSTRMst ---");
        try {
            const res1 = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_VSTRMst'");
            console.table(res1.recordset);
        } catch (e) { console.log("Mx_VSTRMst not found"); }

        console.log("\n--- Mx_VSTRPassTrn ---");
        try {
            const res2 = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_VSTRPassTrn'");
            console.table(res2.recordset);
        } catch (e) { console.log("Mx_VSTRPassTrn not found"); }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkVisitorSchema();

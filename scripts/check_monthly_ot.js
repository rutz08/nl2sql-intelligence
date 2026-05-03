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

async function checkMonthly() {
    try {
        await sql.connect(dbConfig);
        
        console.log("--- Mx_VEW_RBMonthlyATDSummary ---");
        const res = await sql.query('SELECT TOP 0 * FROM Mx_VEW_RBMonthlyATDSummary');
        console.log(Object.keys(res.recordset.columns).join(", "));
        
        console.log("\nSample Data:");
        const data = await sql.query('SELECT TOP 1 * FROM Mx_VEW_RBMonthlyATDSummary');
        console.log(data.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMonthly();

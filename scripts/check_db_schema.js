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

async function checkColumns() {
    try {
        await sql.connect(dbConfig);
        
        console.log("--- Mx_VEW_DailyAttendance ---");
        const res1 = await sql.query('SELECT TOP 0 * FROM Mx_VEW_DailyAttendance');
        console.log(Object.keys(res1.recordset.columns).join(", "));
        
        console.log("\n--- Mx_ATDProcess ---");
        const res3 = await sql.query('SELECT TOP 0 * FROM Mx_ATDProcess');
        console.log(Object.keys(res3.recordset.columns).join(", "));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumns();

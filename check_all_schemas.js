const sql = require('mssql');
const config = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function check() {
    try {
        let pool = await sql.connect(config);
        
        console.log("--- Mx_VEW_LiveRoomStatus ---");
        let r1 = await pool.request().query("SELECT TOP 1 * FROM Mx_VEW_LiveRoomStatus");
        console.log(Object.keys(r1.recordset.columns).join(', '));

        console.log("\n--- Mx_VEW_VistorReport SAMPLE ---");
        let r2 = await pool.request().query("SELECT TOP 1 * FROM Mx_VEW_VistorReport");
        console.log(r2.recordset[0]);

        console.log("\n--- Mx_VEW_DailyCnteenEvts ---");
        let r3 = await pool.request().query("SELECT TOP 1 * FROM Mx_VEW_DailyCnteenEvts");
        console.log(Object.keys(r3.recordset.columns).join(', '));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();

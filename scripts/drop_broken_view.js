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

async function dropView() {
    try {
        const pool = await sql.connect(config);
        console.log("Checking for broken view...");
        await pool.request().query("IF OBJECT_ID('Mx_VEW_DailyAttendanceComplete', 'V') IS NOT NULL DROP VIEW Mx_VEW_DailyAttendanceComplete");
        console.log("Successfully dropped view: Mx_VEW_DailyAttendanceComplete");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dropView();

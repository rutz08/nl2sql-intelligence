const sql = require('mssql');
const dbConfig = { user: 'sa', password: '12345', server: 'localhost', database: 'COSEC_DEMO', options: { encrypt: false, trustServerCertificate: true } };
async function check() {
    try {
        let pool = await sql.connect(dbConfig);
        const res = await pool.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_DailyAttendance'");
        console.log("Mx_DailyAttendance Columns:");
        console.log(res.recordset.map(r => r.COLUMN_NAME).join(', '));
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();

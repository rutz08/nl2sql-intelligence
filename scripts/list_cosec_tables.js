const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: { encrypt: true, trustServerCertificate: true }
};

async function checkTables() {
    try {
        await sql.connect(dbConfig);
        console.log("--- Tables in COSEC ---");
        const res = await sql.query("SELECT COUNT(*) as count FROM Mx_VEW_DailyAttendance WHERE CAST(PDate AS DATE) = '2026-04-27' AND Punch1 IS NULL");
        console.table(res.recordset);
    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}
checkTables();

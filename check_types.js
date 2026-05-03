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

(async () => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Mx_VEW_DailyAttendance'");
        console.table(result.recordset);
        await sql.close();
    } catch (err) {
        console.error(err);
    }
})();

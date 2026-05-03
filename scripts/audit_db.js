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

async function audit() {
    try {
        const pool = await sql.connect(config);
        
        console.log("--- VIEW DEFINITION ---");
        const viewDef = await pool.request().query("SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('Mx_VEW_DailyAttendance')");
        console.log(viewDef.recordset[0].definition);

        console.log("\n--- ALL VIEWS ---");
        const views = await pool.request().query("SELECT name FROM sys.views");
        console.log(views.recordset.map(v => v.name).join(', '));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();

const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC',
    options: { encrypt: true, trustServerCertificate: true }
};

async function checkView() {
    try {
        await sql.connect(dbConfig);
        const res = await sql.query("SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('Mx_VEW_UserDetails')");
        console.log(res.recordset[0].definition);
    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}
checkView();

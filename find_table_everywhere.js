const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'master',
    options: { encrypt: true, trustServerCertificate: true }
};

async function findTable() {
    try {
        await sql.connect(dbConfig);
        console.log("--- Searching All Databases for Mx_UserMst ---");
        const res = await sql.query("EXEC sp_MSforeachdb 'USE [?]; IF OBJECT_ID(''Mx_UserMst'') IS NOT NULL SELECT DB_NAME() as DB, name FROM sys.objects WHERE name = ''Mx_UserMst'''");
        // sp_MSforeachdb returns multiple recordsets
        console.log(JSON.stringify(res.recordsets.filter(rs => rs.length > 0), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}
findTable();

const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC',
    options: { encrypt: true, trustServerCertificate: true }
};

async function findTableByColumn() {
    try {
        await sql.connect(dbConfig);
        const res = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'IntegrationRef'");
        console.table(res.recordset);
    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}
findTableByColumn();

require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '12345',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'COSEC_DEMO',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: false
    }
};

async function checkColumns() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log('Checking columns for Mx_VEW_LiveRoomStatus...');
        const result = await pool.request().query("SELECT TOP 0 * FROM Mx_VEW_LiveRoomStatus");
        console.log('Columns:', Object.keys(result.recordset.columns));
        await pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkColumns();

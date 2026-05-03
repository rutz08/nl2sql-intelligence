const sql = require('mssql');
const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: false
    }
};

async function searchOT() {
    try {
        await sql.connect(dbConfig);
        
        console.log("Searching for columns matching '%OT%', '%Overtime%', '%Ovt%'...");
        const result = await sql.query(`
            SELECT 
                t.name AS TableName,
                c.name AS ColumnName
            FROM sys.columns c
            JOIN sys.objects t ON c.object_id = t.object_id
            WHERE (c.name LIKE '%OT%' 
               OR c.name LIKE '%Overtime%'
               OR c.name LIKE '%Ovt%')
            AND t.name LIKE 'Mx_%'
            ORDER BY TableName, ColumnName
        `);
        
        console.table(result.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

searchOT();

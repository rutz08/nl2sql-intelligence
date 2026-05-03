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

async function findOTTable() {
    try {
        await sql.connect(dbConfig);
        
        const query = `
            SELECT 
                t.name AS TableName,
                c.name AS ColumnName
            FROM sys.columns c
            JOIN sys.objects t ON c.object_id = t.object_id
            WHERE t.type IN ('U', 'V')
            AND t.name NOT LIKE 'sys%'
            AND (c.name LIKE '%OT%' OR c.name LIKE '%OverTime%' OR c.name LIKE '%Ovt%')
            ORDER BY t.name
        `;
        
        const result = await sql.query(query);
        console.table(result.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findOTTable();

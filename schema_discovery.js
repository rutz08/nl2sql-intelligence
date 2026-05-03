const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function discoverSchema() {
    try {
        await sql.connect(dbConfig);
        console.log("Connected to Database. Scanning for COSEC Tables and Views...");

        const query = `
            SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME LIKE 'Mx_VEW_%' OR TABLE_NAME LIKE 'Mx_%'
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `;

        const result = await sql.query(query);
        const schema = {};

        result.recordset.forEach(row => {
            if (!schema[row.TABLE_NAME]) {
                schema[row.TABLE_NAME] = [];
            }
            schema[row.TABLE_NAME].push({
                column: row.COLUMN_NAME,
                type: row.DATA_TYPE
            });
        });

        // Write the discovered schema to a JSON file
        const fs = require('fs');
        fs.writeFileSync('discovered_schema.json', JSON.stringify(schema, null, 2));
        
        console.log(`✅ Discovery Complete! Found ${Object.keys(schema).length} tables/views.`);
        console.log("Details saved to discovered_schema.json");

    } catch (err) {
        console.error("Discovery Error:", err.message);
    } finally {
        await sql.close();
    }
}

discoverSchema();

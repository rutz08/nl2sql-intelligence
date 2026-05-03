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

async function populateVisitors() {
    try {
        await sql.connect(dbConfig);
        console.log("Connected to database...");

        // 1. Clear existing dummy data (optional but good for clean state)
        // await sql.query("DELETE FROM Mx_VSTRPassTrn");
        // await sql.query("DELETE FROM Mx_VSTRMst");

        const istOffset = 5.5 * 60 * 60 * 1000;
        const today = new Date(Date.now() + istOffset);
        const yesterday = new Date(Date.now() + istOffset - 24 * 60 * 60 * 1000);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        console.log(`Today: ${todayStr}, Yesterday: ${yesterdayStr}`);

        // 2. Insert into Mx_VSTRMst
        const visitors = [
            { id: 101, name: 'John Doe', org: 'TechCorp', mobile: '9876543210', proof: 'Aadhar-1234' },
            { id: 102, name: 'Alice Smith', org: 'GlobalSoft', mobile: '8765432109', proof: 'PAN-5678' },
            { id: 103, name: 'Bob Wilson', org: 'Matrix Solutions', mobile: '7654321098', proof: 'Driving-9012' },
            { id: 104, name: 'Charlie Brown', org: 'TechCorp', mobile: '6543210987', proof: 'Aadhar-4321' }
        ];

        for (const v of visitors) {
            await sql.query(`
                IF NOT EXISTS (SELECT 1 FROM Mx_VSTRMst WHERE VSTRID = ${v.id})
                INSERT INTO Mx_VSTRMst (VSTRID, VstrName, Organization, MobileNo, IDProofNo)
                VALUES (${v.id}, '${v.name}', '${v.org}', '${v.mobile}', '${v.proof}')
            `);
        }
        console.log("Visitor Master populated.");

        // 3. Insert into Mx_VSTRPassTrn
        // Status mapping: 0=Expected, 1=Checked In, 2=Checked Out, 3=Exited
        const passes = [
            { pass: 1001, vstrId: 101, date: todayStr, from: `${todayStr} 09:30:00`, to: `${todayStr} 11:30:00`, status: 1 },
            { pass: 1002, vstrId: 102, date: todayStr, from: `${todayStr} 10:00:00`, to: null, status: 0 },
            { pass: 1003, vstrId: 103, date: yesterdayStr, from: `${yesterdayStr} 14:00:00`, to: `${yesterdayStr} 16:00:00`, status: 3 },
            { pass: 1004, vstrId: 104, date: yesterdayStr, from: `${yesterdayStr} 11:00:00`, to: `${yesterdayStr} 13:00:00`, status: 3 }
        ];

        for (const p of passes) {
            const toVal = p.to ? `'${p.to}'` : 'NULL';
            await sql.query(`
                IF NOT EXISTS (SELECT 1 FROM Mx_VSTRPassTrn WHERE PassNo = ${p.pass})
                INSERT INTO Mx_VSTRPassTrn (PassNo, VSTRID, VPassDate, PassFromDate, PassToDate, Status)
                VALUES (${p.pass}, ${p.vstrId}, '${p.date}', '${p.from}', ${toVal}, ${p.status})
            `);
        }
        console.log("Visitor Transactions populated.");

        // 4. Create View if missing (to ensure bot works)
        // We drop and recreate it to ensure the CASE mapping is present
        await sql.query(`
            IF EXISTS (SELECT * FROM sys.views WHERE name = 'Mx_VEW_VistorReport')
            DROP VIEW Mx_VEW_VistorReport
        `);
        
        await sql.query(`
            EXEC('CREATE VIEW Mx_VEW_VistorReport AS 
                  SELECT p.PassNo, v.VstrName as VistorName, v.Organization, v.MobileNo,
                         p.VPassDate, p.PassFromDate, p.PassToDate, 
                         CASE 
                            WHEN p.Status = 0 THEN ''Expected''
                            WHEN p.Status = 1 THEN ''Checked In''
                            WHEN p.Status = 2 THEN ''Checked Out''
                            WHEN p.Status = 3 THEN ''Exited''
                            ELSE ''Unknown''
                         END as Status
                  FROM Mx_VSTRPassTrn p
                  JOIN Mx_VSTRMst v ON p.VSTRID = v.VSTRID')
        `);
        console.log("Visitor View (Mx_VEW_VistorReport) verified/created with Status mapping.");

        process.exit(0);
    } catch (err) {
        console.error("Error populating data:", err);
        process.exit(1);
    }
}

populateVisitors();

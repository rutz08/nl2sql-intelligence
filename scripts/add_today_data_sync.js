const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: { encrypt: false, trustServerCertificate: true, useUTC: false }
};

async function addTodayData() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log("--- Initializing Today's Data Seeding (Regular Basis Sync) ---");

        // Use IST for date calculation
        const istOffset = 5.5 * 60 * 60 * 1000;
        const today = new Date(Date.now() + istOffset);
        const todayStr = today.toISOString().split('T')[0];
        
        console.log(`Target Date: ${todayStr}`);

        // Cleanup today's data if it somehow exists to avoid duplicates
        await pool.request().query(`DELETE FROM Mx_ACSEventTrn WHERE CAST(EventDT AS DATE) = '${todayStr}'`);
        await pool.request().query(`DELETE FROM Mx_CnteenPunchTrn WHERE CAST(PunchDate AS DATE) = '${todayStr}'`);
        await pool.request().query(`DELETE FROM Mx_DailyAttendance WHERE PDate = '${todayStr}'`);
        await pool.request().query(`DELETE FROM Mx_VSTRPassTrn WHERE VPassDate = '${todayStr}'`);

        const usersRes = await pool.request().query("SELECT UserID FROM Mx_UserMst");
        const userIds = usersRes.recordset.map(r => r.UserID);

        const pad = (n) => n.toString().padStart(2, '0');
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

        console.log(`Processing ${userIds.length} users for attendance...`);

        for (const uid of userIds) {
            // General Shift (User 1-15)
            if (uid <= 15) {
                const inMins = rand(0, 15);
                const outMins = rand(0, 45);
                const actualIn = `${todayStr} 09:${pad(inMins)}:00`;
                const actualOut = `${todayStr} 18:${pad(outMins)}:00`;
                
                await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${actualIn}', 1, 1, 'Access Granted')`);
                await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${actualOut}', 1, 1, 'Access Granted')`);

                const workTime = 480 + outMins - inMins;
                await pool.request().query(`INSERT INTO Mx_DailyAttendance (UserID, PDate, Punch1, Punch2, Punch3, Punch4, WorkTime, BreakTime) 
                    VALUES (${uid}, '${todayStr}', '${actualIn}', '${todayStr} 13:00:00', '${todayStr} 14:00:00', '${actualOut}', ${workTime}, 60)`);

                // Canteen
                await pool.request().query(`INSERT INTO Mx_CnteenPunchTrn (UserID, PunchDate, Quantity, ItemName) VALUES (${uid}, '${todayStr} 13:${pad(rand(10, 50))}:00', 1, 'Lunch Thali')`);
            } else {
                // Night Shift (User 16-20)
                const inTime = `${todayStr} 22:${pad(rand(0, 15))}:00`;
                await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${inTime}', 1, 1, 'Access Granted')`);
                // Note: Night shift out time will be tomorrow, so we only log in for today
                await pool.request().query(`INSERT INTO Mx_DailyAttendance (UserID, PDate, Punch1) 
                    VALUES (${uid}, '${todayStr}', '${inTime}')`);
            }
        }

        // --- Visitor Data for Today ---
        console.log("Populating visitors for today...");
        const visitors = [
            { pass: 5001, vstrId: 101, name: 'John Doe', org: 'TechCorp', in: '09:30', out: '11:45', status: 3 },
            { pass: 5002, vstrId: 102, name: 'Alice Smith', org: 'GlobalSoft', in: '10:15', out: null, status: 1 },
            { pass: 5003, vstrId: 103, name: 'Bob Wilson', org: 'Matrix', in: '14:20', out: '15:30', status: 3 }
        ];

        for (const v of visitors) {
            const outVal = v.out ? `'${todayStr} ${v.out}:00'` : 'NULL';
            
            // Ensure visitor exists in Master
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM Mx_VSTRMst WHERE VSTRID = ${v.vstrId})
                INSERT INTO Mx_VSTRMst (VSTRID, VstrName, Organization, MobileNo)
                VALUES (${v.vstrId}, '${v.name}', '${v.org}', '9810000000')
            `);
            
            await pool.request().query(`
                INSERT INTO Mx_VSTRPassTrn (PassNo, VSTRID, VPassDate, PassFromDate, PassToDate, Status)
                VALUES (${v.pass}, ${v.vstrId}, '${todayStr}', '${todayStr} ${v.in}:00', ${outVal}, ${v.status})
            `);
        }

        console.log("--- Today's Data Sync Completed Successfully ---");
        process.exit(0);
    } catch (err) {
        console.error("Critical Error during data population:", err);
        process.exit(1);
    }
}

addTodayData();

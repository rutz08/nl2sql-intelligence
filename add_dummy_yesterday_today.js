const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: { encrypt: false, trustServerCertificate: true }
};

async function addSmartDummyData() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log("--- Initializing Smart Data Seeding (Deep Sync v2) ---");

        // Cleanup
        await pool.request().query("DELETE FROM Mx_ACSEventTrn");
        await pool.request().query("DELETE FROM Mx_CnteenPunchTrn");
        await pool.request().query("DELETE FROM Mx_DailyAttendance");

        const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // IST
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const usersRes = await pool.request().query("SELECT UserID FROM Mx_UserDetails");
        const userIds = usersRes.recordset.map(r => r.UserID);

        const pad = (n) => n.toString().padStart(2, '0');
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

        for (const uid of userIds) {
            if (uid <= 15) {
                // --- General Shift (09:00 - 18:00) ---
                console.log(`Deep Seeding User ${uid} (General)...`);
                
                const inMins = rand(0, 15);
                const outMins = rand(0, 45);
                const actualIn = `${yesterdayStr} 09:${pad(inMins)}:00`;
                const actualOut = `${yesterdayStr} 18:${pad(outMins)}:00`;
                
                await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${actualIn}', 1, 1, 'Access Granted')`);
                await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${actualOut}', 1, 1, 'Access Granted')`);

                const workTime = 480 + outMins - inMins;
                // Punch1=In, Punch2=BreakStart, Punch3=BreakEnd, Punch4=Out
                await pool.request().query(`INSERT INTO Mx_DailyAttendance (UserID, PDate, Punch1, Punch2, Punch3, Punch4, WorkTime, BreakTime) 
                    VALUES (${uid}, '${yesterdayStr}', '${actualIn}', '${yesterdayStr} 13:00:00', '${yesterdayStr} 14:00:00', '${actualOut}', ${workTime}, 60)`);

                await pool.request().query(`INSERT INTO Mx_CnteenPunchTrn (UserID, PunchDate, Quantity, ItemName) VALUES (${uid}, '${yesterdayStr} 13:${pad(rand(10, 50))}:00', 1, 'Lunch Thali')`);
            } else {
                // --- Night Shift (22:00 - 06:00) ---
                console.log(`Deep Seeding User ${uid} (Night)...`);
                
                const inTime = `${yesterdayStr} 22:${pad(rand(0, 15))}:00`;
                await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${inTime}', 1, 1, 'Access Granted')`);

                if (uid === 20) {
                    await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${todayStr} 04:30:00', 5, 1, 'Access Granted')`);
                } else {
                    const outTime = `${todayStr} 05:${pad(rand(0, 30))}:00`;
                    await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${outTime}', 1, 1, 'Access Granted')`);
                    
                    await pool.request().query(`INSERT INTO Mx_DailyAttendance (UserID, PDate, Punch1, Punch2, Punch3, Punch4, WorkTime, BreakTime) 
                        VALUES (${uid}, '${yesterdayStr}', '${inTime}', NULL, NULL, '${outTime}', 420, 0)`);
                }
            }
        }

        console.log("--- Deep Smart Seeding v2 Completed ---");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

addSmartDummyData();

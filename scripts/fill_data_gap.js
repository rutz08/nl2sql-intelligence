const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'COSEC_DEMO',
    options: { encrypt: false, trustServerCertificate: true, useUTC: false }
};

async function fillDataGap() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log("--- Filling Data Gap (Multi-Day Sync) ---");

        // 1. Find the last date
        const lastDateRes = await pool.query("SELECT MAX(PDate) as lastDate FROM Mx_DailyAttendance");

        // 2. Target today (IST)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const todayIST = new Date(Date.now() + istOffset);
        const todayStr = todayIST.toISOString().split('T')[0];
        
        console.log(`Last Date in DB: ${lastDateRes.recordset[0].lastDate.toISOString().split('T')[0]}`);
        console.log(`Targeting until: ${todayStr}`);
        
        let current = new Date(lastDateRes.recordset[0].lastDate);
        current.setDate(current.getDate() + 1); 

        const usersRes = await pool.request().query("SELECT UserID FROM Mx_UserMst");
        const userIds = usersRes.recordset.map(r => r.UserID);

        const pad = (n) => n.toString().padStart(2, '0');
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

        while (current.toISOString().split('T')[0] <= todayStr) {
            const dateStr = current.toISOString().split('T')[0];
            console.log(`Processing Date: ${dateStr}...`);

            for (const uid of userIds) {
                // Attendance
                if (uid <= 15) {
                    const inMins = rand(0, 15);
                    const outMins = rand(0, 45);
                    const actualIn = `${dateStr} 09:${pad(inMins)}:00`;
                    const actualOut = `${dateStr} 18:${pad(outMins)}:00`;
                    
                    await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${actualIn}', 1, 1, 'Access Granted')`);
                    await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${actualOut}', 1, 1, 'Access Granted')`);

                    const workTime = 480 + outMins - inMins;
                    await pool.request().query(`INSERT INTO Mx_DailyAttendance (UserID, PDate, Punch1, Punch2, Punch3, Punch4, WorkTime, BreakTime) 
                        VALUES (${uid}, '${dateStr}', '${actualIn}', '${dateStr} 13:00:00', '${dateStr} 14:00:00', '${actualOut}', ${workTime}, 60)`);

                    // Canteen
                    await pool.request().query(`INSERT INTO Mx_CnteenPunchTrn (UserID, PunchDate, Quantity, ItemName) VALUES (${uid}, '${dateStr} 13:${pad(rand(10, 50))}:00', 1, 'Lunch Thali')`);
                } else {
                    const inTime = `${dateStr} 22:${pad(rand(0, 15))}:00`;
                    await pool.request().query(`INSERT INTO Mx_ACSEventTrn (UserID, EventDT, MID, EventID, EventDesc) VALUES (${uid}, '${inTime}', 1, 1, 'Access Granted')`);
                    await pool.request().query(`INSERT INTO Mx_DailyAttendance (UserID, PDate, Punch1) VALUES (${uid}, '${dateStr}', '${inTime}')`);
                }
            }

            // Random Visitors for this day
            const visitorCount = rand(1, 4);
            for (let i = 0; i < visitorCount; i++) {
                const passNo = rand(6000, 9999) + current.getTime() % 1000;
                const vstrId = rand(101, 104);
                const inH = rand(9, 15);
                const inM = rand(0, 59);
                const outH = inH + rand(1, 3);
                
                await pool.request().query(`
                    INSERT INTO Mx_VSTRPassTrn (PassNo, VSTRID, VPassDate, PassFromDate, PassToDate, Status)
                    VALUES (${passNo}, ${vstrId}, '${dateStr}', '${dateStr} ${pad(inH)}:${pad(inM)}:00', '${dateStr} ${pad(outH)}:00:00', 3)
                `);
            }

            current.setDate(current.getDate() + 1);
        }

        console.log("--- Gap Fill Sync Completed Successfully ---");
        process.exit(0);
    } catch (err) {
        console.error("Critical Error:", err);
        process.exit(1);
    }
}

fillDataGap();

const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'master',
    options: { encrypt: true, trustServerCertificate: true, requestTimeout: 300000 }
};

async function createFullReplica() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log("--- Initializing MASTER COSEC_DEMO ---");

        await pool.query("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'COSEC_DEMO') CREATE DATABASE COSEC_DEMO");
        await sql.close();

        const demoPool = await sql.connect({ ...dbConfig, database: 'COSEC_DEMO' });

        // 1. Schema
        const tables = [
            `CREATE TABLE Mx_OrganizationMst (ORGID INT PRIMARY KEY, Name VARCHAR(100))`,
            `CREATE TABLE Mx_UserDetails (UserID INT, UserName VARCHAR(50), FullName VARCHAR(100), DptName VARCHAR(50), BrcName VARCHAR(50), DsgName VARCHAR(50))`,
            `CREATE TABLE Mx_ControllerMst (MID INT PRIMARY KEY, Name VARCHAR(50))`,
            `CREATE TABLE Mx_BranchMst (BRCID INT PRIMARY KEY, Name VARCHAR(100))`,
            `CREATE TABLE Mx_DepartmentMst (DPTID INT PRIMARY KEY, Name VARCHAR(100))`,
            `CREATE TABLE Mx_DesignationMst (DSGID INT PRIMARY KEY, Name VARCHAR(100))`,
            `CREATE TABLE Mx_UserMst (UserID INT PRIMARY KEY, Name VARCHAR(100), FullName VARCHAR(200), ORGID INT, BRCID INT, DPTID INT, DSGID INT)`,
            `CREATE TABLE Mx_MasterControllerBasicCfg (MID INT PRIMARY KEY, NAME VARCHAR(100), CURRENTSTATUS INT)`,
            `CREATE TABLE Mx_MasterControllerNwkCfg (MID INT PRIMARY KEY, IPAddress VARCHAR(50))`,
            `CREATE TABLE Mx_ACSEventTrn (UserID INT, EventDT DATETIME, MID INT, EventID INT, EventDesc VARCHAR(100))`,
            `CREATE TABLE Mx_DailyAttendance (UserID INT, PDate DATE, Punch1 DATETIME, Punch2 DATETIME, Punch3 DATETIME, Punch4 DATETIME, WorkTime INT, BreakTime INT)`,
            `CREATE TABLE Mx_CnteenPunchTrn (UserID INT, PunchDate DATETIME, Quantity INT, ItemName VARCHAR(50))`,
            `CREATE TABLE Mx_VSTRMst (VSTRID INT, VstrName VARCHAR(100), Organization VARCHAR(100), MobileNo VARCHAR(20), IDProofNo VARCHAR(50))`,
            `CREATE TABLE Mx_VSTRPassTrn (PassNo INT, VSTRID INT, VPassDate DATETIME, PassFromDate DATETIME, PassToDate DATETIME, Status INT)`
        ];

        for (let q of tables) {
            const tableName = q.match(/CREATE TABLE (\w+)/)[1];
            await demoPool.query(`IF OBJECT_ID('${tableName}') IS NOT NULL DROP TABLE ${tableName}`);
            await demoPool.query(q);
        }

        // 2. Masters
        await demoPool.query("INSERT INTO Mx_OrganizationMst VALUES (1, 'SAHAY Corp')");
        await demoPool.query("INSERT INTO Mx_BranchMst VALUES (1, 'HQ')");
        await demoPool.query("INSERT INTO Mx_DepartmentMst VALUES (1, 'IT'), (2, 'HR'), (3, 'Admin')");
        await demoPool.query("INSERT INTO Mx_DesignationMst VALUES (1, 'Manager'), (2, 'Developer')");

        const devices = [
            {id: 1, name: 'Main Gate', ip: '192.168.1.10'},
            {id: 2, name: 'Server Room', ip: '192.168.1.11'},
            {id: 3, name: 'HR Department', ip: '192.168.1.12'},
            {id: 4, name: 'Canteen Entry', ip: '192.168.1.13'},
            {id: 5, name: 'MD Cabin', ip: '192.168.1.14'},
            {id: 6, name: 'Finance Office', ip: '192.168.1.15'},
            {id: 7, name: 'R&D Lab', ip: '192.168.1.16'}
        ];
        for (let dev of devices) {
            await demoPool.query(`INSERT INTO Mx_MasterControllerBasicCfg VALUES (${dev.id}, '${dev.name}', 1)`);
            await demoPool.query(`INSERT INTO Mx_MasterControllerNwkCfg VALUES (${dev.id}, '${dev.ip}')`);
        }

        for (let i = 1; i <= 20; i++) {
            await demoPool.query(`INSERT INTO Mx_UserMst VALUES (${i}, 'user${i}', 'Employee ${i}', 1, 1, ${(i%3)+1}, 1)`);
        }

        await demoPool.query(`INSERT INTO Mx_UserDetails VALUES (1, 'user1', 'Employee 1', 'IT', 'Main Branch', 'Software Engineer')`);
        await demoPool.query(`INSERT INTO Mx_UserDetails VALUES (2, 'user2', 'Employee 2', 'HR', 'Main Branch', 'HR Manager')`);
        await demoPool.query(`INSERT INTO Mx_UserDetails VALUES (3, 'user3', 'Employee 3', 'Admin', 'Regional Office', 'Admin Officer')`);
        
        for (let i = 4; i <= 20; i++) {
            const dept = i % 3 === 0 ? 'IT' : (i % 3 === 1 ? 'HR' : 'Admin');
            await demoPool.query(`INSERT INTO Mx_UserDetails VALUES (${i}, 'user${i}', 'Employee ${i}', '${dept}', 'Main Branch', 'Engineer')`);
        }

        // 3. Transactions
        const days = 180;
        const start = new Date();
        start.setDate(start.getDate() - days);

        for (let d = 0; d <= days; d++) {
            const current = new Date(start);
            current.setDate(start.getDate() + d);
            const dateStr = current.toISOString().split('T')[0];
            const isToday = d === days;

            for (let uid = 1; uid <= 20; uid++) {
                if (isToday) {
                    // Everyone swipes at Main Gate (In-Punch)
                    await demoPool.query(`INSERT INTO Mx_ACSEventTrn VALUES (${uid}, '${dateStr} 09:05:00', 1, 1, 'Access Granted')`);
                    
                    // Employees 1-3 go to MD Cabin
                    if (uid <= 3) await demoPool.query(`INSERT INTO Mx_ACSEventTrn VALUES (${uid}, '${dateStr} 10:30:00', 5, 1, 'Access Granted')`);
                    
                    // Employees 4-5 go to Server Room
                    if (uid > 3 && uid <= 5) await demoPool.query(`INSERT INTO Mx_ACSEventTrn VALUES (${uid}, '${dateStr} 11:15:00', 2, 1, 'Access Granted')`);

                    // Employees 6-10 go to R&D Lab
                    if (uid > 5 && uid <= 10) await demoPool.query(`INSERT INTO Mx_ACSEventTrn VALUES (${uid}, '${dateStr} 11:30:00', 7, 1, 'Access Granted')`);

                    // Employees 11-13 go to Finance Office
                    if (uid > 10 && uid <= 13) await demoPool.query(`INSERT INTO Mx_ACSEventTrn VALUES (${uid}, '${dateStr} 11:45:00', 6, 1, 'Access Granted')`);

                } else if (current.getDay() !== 0 && current.getDay() !== 6) {
                    // Simulation: 4 Punches for Break Calculation
                    // IT (DPT 1): 60 min break
                    // HR (DPT 2): 90 min break
                    // Admin (DPT 3): 45 min break
                    const dptId = (uid % 3) + 1;
                    let breakMins = 60;
                    if (dptId === 2) breakMins = 90;
                    if (dptId === 3) breakMins = 45;

                    const p1 = `${dateStr} 09:00:00`;
                    const p2 = `${dateStr} 13:00:00`; // Lunch Out
                    const p3 = `${dateStr} 13:${breakMins === 90 ? '30' : breakMins}:00`; 
                    // To handle 90 mins correctly: 13:00 + 90 mins = 14:30
                    let p3_time = `14:00:00`;
                    if (dptId === 2) p3_time = `14:30:00`;
                    if (dptId === 3) p3_time = `13:45:00`;
                    if (dptId === 1) p3_time = `14:00:00`;

                    const p3_full = `${dateStr} ${p3_time}`;
                    const p4 = `${dateStr} 18:00:00`;
                    
                    // WorkTime = (P2-P1) + (P4-P3)
                    // HR: (4h) + (3.5h) = 7.5h = 450 mins
                    // IT: (4h) + (4h) = 8h = 480 mins
                    // Admin: (4h) + (4.25h) = 8.25h = 495 mins
                    let workMins = 480;
                    if (dptId === 2) workMins = 450;
                    if (dptId === 3) workMins = 495;

                    await demoPool.query(`INSERT INTO Mx_DailyAttendance VALUES (${uid}, '${dateStr}', '${p1}', '${p2}', '${p3_full}', '${p4}', ${workMins}, ${breakMins})`);
                }
            }
        }

        // 4. Views
        await demoPool.query(`CREATE OR ALTER VIEW Mx_VEW_UserDetails AS SELECT UserID, UserName, FullName, DptName, BrcName, DsgName FROM Mx_UserDetails`);
        
        await demoPool.query(`
            CREATE OR ALTER VIEW Mx_VEW_LiveRoomStatus AS
            WITH LastEvents AS (SELECT UserID, MID, EventDT, ROW_NUMBER() OVER(PARTITION BY UserID ORDER BY EventDT DESC) as rank FROM Mx_ACSEventTrn WHERE CAST(EventDT AS DATE) = CAST(GETDATE() AS DATE))
            SELECT E.UserID, U.FullName, U.DptName, C.NAME as CurrentRoom, E.EventDT as LastSeen FROM LastEvents E JOIN Mx_VEW_UserDetails U ON E.UserID = U.UserID JOIN Mx_MasterControllerBasicCfg C ON E.MID = C.MID WHERE E.rank = 1
        `);

        await demoPool.query(`
            CREATE OR ALTER VIEW Mx_VEW_ControllerList AS
            SELECT C.MID as DeviceID, 
                   C.NAME as DeviceName, 
                   C.NAME as NAME, 
                   N.IPAddress, 
                   C.CURRENTSTATUS as CURRENTSTATUS,
                   CASE WHEN C.CURRENTSTATUS = 1 THEN 'Online' ELSE 'Offline' END as Status
            FROM Mx_MasterControllerBasicCfg C
            LEFT JOIN Mx_MasterControllerNwkCfg N ON C.MID = N.MID
        `);

        await demoPool.query(`
            CREATE OR ALTER VIEW Mx_VEW_DailyAttendance AS 
            SELECT A.UserID, U.UserName, U.FullName, U.DptName, A.PDate, 
            'General' as WorkingShift, '09:00' as ShiftStart, '18:00' as ShiftEnd, 
            A.Punch1 as ActualInTime, A.Punch4 as ActualOutTime, 
            A.Punch2 as BreakStart, A.Punch3 as BreakEnd,
            A.WorkTime, A.BreakTime,
            FORMAT(DATEADD(MINUTE, A.WorkTime, 0), 'HH:mm') as WorkTime_HHMM,
            FORMAT(DATEADD(MINUTE, A.BreakTime, 0), 'HH:mm') as BreakTime_HHMM
            FROM Mx_DailyAttendance A 
            JOIN Mx_VEW_UserDetails U ON A.UserID = U.UserID
        `);

        // 5. Visitor Data
        await demoPool.query(`INSERT INTO Mx_VSTRMst VALUES (1, 'John Smith', 'TechCorp', '9876543210', 'Aadhar-1234')`);
        await demoPool.query(`INSERT INTO Mx_VSTRMst VALUES (2, 'Jane Doe', 'Matrix', '9876543211', 'DL-5678')`);
        
        await demoPool.query(`INSERT INTO Mx_VSTRPassTrn VALUES (101, 1, GETDATE(), DATEADD(HOUR, -2, GETDATE()), NULL, 1)`); // Currently Checked In
        await demoPool.query(`INSERT INTO Mx_VSTRPassTrn VALUES (102, 2, GETDATE(), DATEADD(HOUR, -4, GETDATE()), DATEADD(HOUR, -1, GETDATE()), 0)`); // Checked Out

        await demoPool.query(`
            CREATE OR ALTER VIEW Mx_VEW_VistorEntry AS
            SELECT P.PassNo as EntryID, V.VstrName, V.Organization as Company, 'MD' as HostName, 
            'Meeting' as Purpose, CAST(P.VPassDate AS DATE) as VisitDate, 
            P.PassFromDate as CheckInTime, P.PassToDate as CheckOutTime,
            CASE WHEN P.Status = 1 THEN 'Checked In' ELSE 'Checked Out' END as Status
            FROM Mx_VSTRPassTrn P
            JOIN Mx_VSTRMst V ON P.VSTRID = V.VSTRID
        `);

        // 6. Canteen Data
        await demoPool.query(`INSERT INTO Mx_CnteenPunchTrn VALUES (1, DATEADD(DAY, -1, GETDATE()), 1, 'Lunch')`);
        await demoPool.query(`INSERT INTO Mx_CnteenPunchTrn VALUES (2, DATEADD(DAY, -1, GETDATE()), 1, 'Lunch')`);
        await demoPool.query(`INSERT INTO Mx_CnteenPunchTrn VALUES (3, DATEADD(DAY, -1, GETDATE()), 1, 'Breakfast')`);
        await demoPool.query(`INSERT INTO Mx_CnteenPunchTrn VALUES (1, GETDATE(), 1, 'Lunch')`);

        await demoPool.query(`
            CREATE OR ALTER VIEW Mx_VEW_DailyCnteenEvts AS
            SELECT C.UserID, U.UserName, U.FullName, U.DptName, U.BrcName, 
            CAST(C.PunchDate AS DATE) as PDate, C.ItemName, C.Quantity,
            (C.Quantity * CASE WHEN C.ItemName = 'Lunch' THEN 50 ELSE 30 END) as TotalAmount
            FROM Mx_CnteenPunchTrn C
            JOIN Mx_VEW_UserDetails U ON C.UserID = U.UserID
        `);

        console.log("--- REPLICA COMPLETE WITH VMS AND CANTEEN ---");

        console.log("--- REPLICA COMPLETE WITH DEVICES AND LIVE STATUS ---");

    } catch (err) { console.error(err); }
    finally { sql.close(); }
}

createFullReplica();

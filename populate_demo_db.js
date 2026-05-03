const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'master', // Start with master to create the new DB
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function createDemoDatabase() {
    try {
        let pool = await sql.connect(dbConfig);
        console.log("--- Creating COSEC_DEMO Database ---");
        
        // 1. Create the Database
        try {
            await pool.query("CREATE DATABASE COSEC_DEMO");
            console.log("Database COSEC_DEMO created.");
        } catch (e) {
            console.log("Database might already exist, skipping creation...");
        }

        await sql.close();

        // 2. Connect to the new DB to create tables
        const demoConfig = { ...dbConfig, database: 'COSEC_DEMO' };
        pool = await sql.connect(demoConfig);

        console.log("--- Cloning Schema and Inserting Random Data ---");

        // --- MASTER DATA ---
        
        // Departments
        await pool.query("IF OBJECT_ID('Mx_DptMst') IS NULL CREATE TABLE Mx_DptMst (DptID INT PRIMARY KEY, DptName VARCHAR(100))");
        await pool.query("DELETE FROM Mx_DptMst");
        await pool.query("INSERT INTO Mx_DptMst VALUES (1, 'IT'), (2, 'HR'), (3, 'Finance'), (4, 'Sales'), (5, 'Production')");

        // Branches
        await pool.query("IF OBJECT_ID('Mx_BrcMst') IS NULL CREATE TABLE Mx_BrcMst (BrcID INT PRIMARY KEY, BrcName VARCHAR(100))");
        await pool.query("DELETE FROM Mx_BrcMst");
        await pool.query("INSERT INTO Mx_BrcMst VALUES (1, 'Main Office'), (2, 'Warehouse'), (3, 'Factory')");

        // Designations
        await pool.query("IF OBJECT_ID('Mx_DsgMst') IS NULL CREATE TABLE Mx_DsgMst (DsgID INT PRIMARY KEY, DsgName VARCHAR(100))");
        await pool.query("DELETE FROM Mx_DsgMst");
        await pool.query("INSERT INTO Mx_DsgMst VALUES (1, 'Manager'), (2, 'Developer'), (3, 'Executive'), (4, 'Technician')");

        // User Master
        await pool.query(`
            IF OBJECT_ID('Mx_UserMst') IS NULL 
            CREATE TABLE Mx_UserMst (
                UserID INT PRIMARY KEY, 
                UserName VARCHAR(100), 
                FullName VARCHAR(100),
                DptID INT, BrcID INT, DsgID INT,
                JoinDT DATETIME,
                MIDENBL BIT DEFAULT 1
            )
        `);
        await pool.query("DELETE FROM Mx_UserMst");

        // Insert 20 Random Users
        const firstNames = ["John", "Jane", "Steve", "Sarah", "Alex", "Emily", "Michael", "Olivia", "Robert", "Sophia"];
        const lastNames = ["Doe", "Smith", "Johnson", "Brown", "Wilson", "Taylor", "Miller", "Davis", "Garcia", "Rodriguez"];
        
        for (let i = 1; i <= 20; i++) {
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
            const dpt = Math.floor(Math.random() * 5) + 1;
            const brc = Math.floor(Math.random() * 3) + 1;
            const dsg = Math.floor(Math.random() * 4) + 1;
            await pool.query(`INSERT INTO Mx_UserMst VALUES (${i}, '${fname.toLowerCase()}${i}', '${fname} ${lname}', ${dpt}, ${brc}, ${dsg}, '2023-01-01', 1)`);
        }

        // --- SHIFTS ---
        await pool.query(`
            IF OBJECT_ID('Mx_ShiftMst') IS NULL 
            CREATE TABLE Mx_ShiftMst (
                SFTID INT PRIMARY KEY, 
                SFTName VARCHAR(50), 
                SFTSTTime TIME, 
                SFTEDTime TIME
            )
        `);
        await pool.query("DELETE FROM Mx_ShiftMst");
        await pool.query("INSERT INTO Mx_ShiftMst VALUES (1, 'General', '09:00', '18:00'), (2, 'Morning', '07:00', '15:00'), (3, 'Night', '22:00', '06:00')");

        // --- ATTENDANCE (Mx_DailyAttendance) ---
        await pool.query(`
            IF OBJECT_ID('Mx_DailyAttendance') IS NULL 
            CREATE TABLE Mx_DailyAttendance (
                UserID INT, 
                PDate DATE, 
                Punch1 DATETIME, 
                Punch2 DATETIME, 
                SFTID INT
            )
        `);
        await pool.query("DELETE FROM Mx_DailyAttendance");

        // Generate data for the last 7 days
        for (let day = 0; day < 7; day++) {
            for (let userId = 1; userId <= 20; userId++) {
                const date = new Date();
                date.setDate(date.getDate() - day);
                const dateStr = date.toISOString().split('T')[0];
                
                // Randomly skip some days for "absences"
                if (Math.random() > 0.1) {
                    const minute1 = Math.floor(Math.random() * 20) + 10;
                    const minute2 = Math.floor(Math.random() * 30);
                    const punchIn = `${dateStr} 09:${minute1}:00`;
                    const punchOut = `${dateStr} 18:${minute2}:00`;
                    await pool.query(`INSERT INTO Mx_DailyAttendance VALUES (${userId}, '${dateStr}', '${punchIn}', '${punchOut}', 1)`);
                }
            }
        }

        // --- LEAVES ---
        await pool.query(`
            IF OBJECT_ID('Mx_LeaveMst') IS NULL CREATE TABLE Mx_LeaveMst (LeaveID VARCHAR(10) PRIMARY KEY, Name VARCHAR(50))
        `);
        await pool.query("DELETE FROM Mx_LeaveMst");
        await pool.query("INSERT INTO Mx_LeaveMst VALUES ('CL', 'Casual Leave'), ('SL', 'Sick Leave'), ('PL', 'Privilege Leave')");

        await pool.query(`
            IF OBJECT_ID('Mx_LeaveTrn') IS NULL 
            CREATE TABLE Mx_LeaveTrn (
                UserID INT, 
                LeaveID VARCHAR(10), 
                FromDate DATE, 
                ToDate DATE, 
                APPLDays FLOAT, 
                SNCNFlg BIT
            )
        `);
        await pool.query("DELETE FROM Mx_LeaveTrn");
        await pool.query("INSERT INTO Mx_LeaveTrn VALUES (1, 'CL', '2024-04-20', '2024-04-21', 2, 1), (5, 'SL', '2024-04-25', '2024-04-25', 1, 1)");

        // --- DEVICES ---
        await pool.query(`
            IF OBJECT_ID('Mx_MasterControllerBasicCfg') IS NULL 
            CREATE TABLE Mx_MasterControllerBasicCfg (
                MID INT PRIMARY KEY, 
                NAME VARCHAR(100), 
                IPADDRESS VARCHAR(50), 
                CURRENTSTATUS INT
            )
        `);
        await pool.query("DELETE FROM Mx_MasterControllerBasicCfg");
        await pool.query("INSERT INTO Mx_MasterControllerBasicCfg VALUES (1, 'Main Entrance', '192.168.1.10', 1), (2, 'Server Room', '192.168.1.11', 1), (3, 'Canteen Door', '192.168.1.12', 0)");

        // --- VIEWS (Crucial for the AI to work) ---
        console.log("--- Creating Views ---");
        await pool.query(`
            CREATE OR ALTER VIEW Mx_VEW_UserDetails AS
            SELECT U.UserID, U.UserName, U.FullName, D.DptName, B.BrcName, Ds.DsgName, U.JoinDT
            FROM Mx_UserMst U
            LEFT JOIN Mx_DptMst D ON U.DptID = D.DptID
            LEFT JOIN Mx_BrcMst B ON U.BrcID = B.BrcID
            LEFT JOIN Mx_DsgMst Ds ON U.DsgID = Ds.DsgID
        `);

        await pool.query(`
            CREATE OR ALTER VIEW Mx_VEW_DailyAttendance AS
            SELECT A.*, U.FullName, D.DptName
            FROM Mx_DailyAttendance A
            JOIN Mx_UserMst U ON A.UserID = U.UserID
            JOIN Mx_DptMst D ON U.DptID = D.DptID
        `);

        await pool.query(`
            CREATE OR ALTER VIEW Mx_VEW_ControllerList AS
            SELECT MID, NAME, IPADDRESS, CURRENTSTATUS, 'Door Controller' as Type
            FROM Mx_MasterControllerBasicCfg
        `);

        console.log("COSEC_DEMO populated successfully!");

    } catch (err) {
        console.error(err);
    } finally {
        sql.close();
    }
}

createDemoDatabase();

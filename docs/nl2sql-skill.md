---
name: nl2sql-schema
description: Provides exact MS SQL COSEC View and Table definitions for the Natural Language to SQL agent, including Attendance, Access Control (ACS), Leave, Visitor (VMS), Canteen/Cafeteria, and Shift management.
---

# NL2SQL Skill: COSEC Database Interface
This skill enables the agent to translate natural language into T-SQL queries for the COSEC attendance system.

### View Column Mappings (Use these EXACTLY)
- **Mx_VEW_DailyAttendance:** `UserID`, `UserName`, `FullName`, `DptName`, `PDate`, `WorkingShift`, `ShiftStart`, `ShiftEnd`, `ActualInTime`, `ActualOutTime`, `BreakStart`, `BreakEnd`, `WorkTime`, `WorkTime_HHMM`, `BreakTime`, `BreakTime_HHMM`.
- **Mx_VEW_DailyCnteenEvts:** `UserID`, `UserName`, `FullName`, `Transaction_date`, `Item_name`, `Item_quantity`, `Item_cost`, `TotalAmount`.
- **Mx_VEW_VistorReport:** `PassNo`, `VistorName`, `Organization`, `MobileNo`, `VPassDate`, `PassFromDate`, `PassToDate`, `Status`.
- **Mx_VEW_LiveRoomStatus (Today Only):** `UserID`, `FullName`, `DptName`, `CurrentRoom`, `LastSeen`. (Filter by `CurrentRoom` for physical locations like "MD Cabin" or "Server Room").
- **Mx_VEW_ControllerList:** `DeviceID`, `DeviceName`, `IPAddress`, `Status`. (Use this for "How many devices are there?" or "List all controllers").

### SQL Generation Rules
- **SQL SYNTAX RULE**: Use strictly **T-SQL (MS SQL Server)** syntax.
  - **DATE RULE**: DO NOT use `WEEK()`. Use `DATEPART(WEEK, date)` or `DATEDIFF(WEEK, 0, date)`.
  - **DATE RULE**: `MONTH(date)` and `YEAR(date)` are valid, but always prefer `DATEPART` for consistency.
  - **CANTEEN RULE**: ALWAYS use `PDate` for canteen transaction dates. DO NOT use `Transaction_date` or `PunchDate`.
  - **TREND RULE**: For "Trend" or "History" queries, NEVER use `TOP` or `LIMIT`. Retrieve all relevant records.
- **Employee Concept:** "Check-in", "Arrival", and "Punch-in" for employees ALWAYS map to `ActualInTime` in `Mx_VEW_DailyAttendance`.
- **Visitor Concept:** ONLY use `Mx_VEW_VistorEntry` if the user explicitly says "Visitor".
- **No Unnecessary Filters:** DO NOT add `WHERE` clauses or `TOP` limits unless explicitly asked (e.g., "offline", "only 1").
- **Limiting Results:** NEVER use `LIMIT`. Use `SELECT TOP N` instead.
- **Date Filtering:** Use `GETDATE()` and `DATEADD` for relative dates. 
- **CRITICAL RULE:** For queries involving "most", "highest", "best", or "total", NEVER use a date filter (like `WHERE PDate = GETDATE()`) unless the user explicitly mentions "today". Default to the entire available history.
- **WORKED LESS LOGIC:** If a user asks "who worked less", ALWAYS include `WHERE WorkTime > 0` because 0 means the employee was absent.
- **TIME FORMATTING:** When selecting `ShiftStart` or `ShiftEnd`, use `FORMAT(ShiftStart, 'HH:mm')` to avoid 1970 date errors.
- **COMPLEX COMPARISON RULE:** When comparing two groups (e.g., "IT vs HR" or "Item A vs Item B"), use a single query with `GROUP BY` and a `WHERE` clause containing `IN ('Group1', 'Group2')`. DO NOT attempt to write two separate queries.
- **DEPARTMENTAL INTELLIGENCE:** Queries about departments (IT, HR, Admin, etc.) should always map to the `DptName` column. If comparing stats between departments, use `AVG()` or `SUM()` grouped by `DptName`.
- **CROSS-DOMAIN JOINING:** If a user asks for data involving different modules (e.g., "employees who had lunch and arrived late"), you MUST `JOIN` the relevant views using `UserID` and `PDate`.

### Example (Trend Query):
Question: "Which item was consumed the most?"
Correct SQL: `SELECT TOP 1 ItemName, SUM(Quantity) as Total FROM Mx_VEW_DailyCnteenEvts GROUP BY ItemName ORDER BY Total DESC`

- **DATE MATH (T-SQL)**: 
  - For "Next X Days": Use `WHERE ExpiryDate <= DATEADD(day, X, GETDATE()) AND ExpiryDate >= GETDATE()`.
  - For "Last Week": Use `WHERE DATEPART(week, DateCol) = DATEPART(week, GETDATE()) - 1`.
  - For "Current Month": Use `WHERE MONTH(DateCol) = MONTH(GETDATE()) AND YEAR(DateCol) = YEAR(GETDATE())`.
- **SECURITY EVENTS**:
  - For "Force Entry", "Emergency Open", or "Access Denied": Use `WHERE EventDesc LIKE '%Force%'` or `LIKE '%Emergency%'` or `LIKE '%Denied%'` on the `Mx_ACSEventTrn` table.
- **CONTROLLER HEALTH**:
  - Since real-time 'Status' is not available in views, if asked for 'Offline' or 'Health', show `Name`, `MID`, and the latest `EventDT` from access events as a proxy for activity.

### Database Schema
You should PREFER querying the Views for attendance, as they already contain joined and aggregated data. For leave, visitor, and shift management, use the specific tables mapped below.

### 1. Attendance & User Core
**View: `Mx_VEW_DailyAttendance`** (Daily Attendance Summary)
- **Identifiers:** `UserID` (INT), `UserName` (NVARCHAR), `FullName` (NVARCHAR)
- **Organization Info:** `OrgName` (NVARCHAR), `BrcName` (Branch), `DptName` (Department)
- **Date:** `PDate` (DATETIME) - Work date.
- **Punches:** `ActualInTime` (DATETIME - First In), `ActualOutTime` (DATETIME - Last Out)
- **Durations (minutes):** `WorkTime`, `BreakTime`
- **Note:** This view only contains records for people who PUNCHED.
- **INT INTELLIGENCE**: User IDs (like 1, 2, 3) are strictly **INTEGERS**. If a user says "1 .2 .3", interpret these as separate IDs: `UserID IN (1, 2, 3)`. NEVER use quotes or dots for UserID filters.

### 2. Live Room Presence (`Mx_VEW_LiveRoomStatus`)
Use for "Who is in [Room Name]?" or "Last seen location".
- **UserID**: Unique ID
- **FullName**: Employee name
- **DptName**: Department
- **CurrentRoom**: The room/cabin where the employee is currently located.
- **LastSeen**: Timestamp of the last movement.

**View: `Mx_VEW_VistorReport`** (Visitor Management)
- **PassNo**: Unique visit ID
- **VistorName**: Name of the visitor
- **Organization**: Visitor's organization
- **MobileNo**: Visitor's mobile number
- **VPassDate**: Date of the visit
- **PassFromDate**: Check-in time
- **PassToDate**: Check-out time
- **Status**: Current status (Expected, Checked In, Checked Out, Exited)

### 4. Canteen Transactions (`Mx_VEW_DailyCnteenEvts`)
Use for meal counts and canteen spending.
- **UserID**: Unique ID
- **UserName**: Login ID
- **FullName**: Employee name
- **DptName**: Department
- **PDate**: Date of transaction
- **ItemName**: Food item consumed (e.g., Lunch, Tea)
- **Quantity**: Number of items
- **TotalAmount**: Cost of the transaction

### SHARED_RULES:
- **IST NATIVE**: The database is already in **IST (Indian Standard Time)**. Operational hours are GS 09:00-18:00 and NS 20:00-05:00.
- **FORMULA INTELLIGENCE**: 
  - Overtime (OT): Calculate as (WorkTime - 480) in minutes. The result is an INTEGER. NEVER cast this integer to TIME.
  - Average Time: To average 'ActualInTime', use: CAST(DATEADD(MINUTE, AVG(DATEDIFF(MINUTE, 0, CAST(ActualInTime AS TIME))), 0) AS TIME).
- **INTELLIGENT RECOVERY**: Never show red errors. Handle missing data with helpful explanations.
- **DATETIME COMPARISON**: When comparing `ActualInTime` to `ShiftStart` in `Mx_VEW_DailyAttendance`, you MUST explicitly `CAST` both to `TIME` because `ShiftStart` might be a string. Example: `CAST(ActualInTime AS TIME) > CAST(ShiftStart AS TIME)`.
- **SHIFT INTELLIGENCE**: When asked for a specific shift (e.g., 'General shift'), prioritize filtering by the `WorkingShift` column (e.g., `WHERE WorkingShift = 'General'`). Avoid adding strict time inequalities on `ActualInTime` or `ActualOutTime` unless the user specifically asks for employees who arrived early or stayed late.
- **TYPE CLARITY**: 'ShiftStart' and 'ShiftEnd' are VARCHAR. Always CAST them to TIME for comparisons (e.g., CAST(ShiftStart AS TIME)).
- **LIVE ROOM LIMITATION**: `Mx_VEW_LiveRoomStatus` is a REAL-TIME view. It contains exactly ONE row per user showing where they are *right now*. It DOES NOT contain historical movement logs. If asked about historical room durations or movement history, DO NOT use `LAG` or `DATEDIFF` to calculate duration. State clearly that historical room tracking is not available.
- **CTE RULE**: NEVER use `ORDER BY` inside a `WITH` clause (CTE). MS SQL Server forbids this. Only use `ORDER BY` in the final outermost query. Furthermore, ALWAYS prefix your `WITH` clause with a semicolon, like this: `;WITH CTE_Name AS (`.
- **TIME CASTING**: `WorkTime` and `BreakTime` are INTEGERS representing **minutes**. When summarizing, convert them to a human-readable format (e.g., 60 = 1 hour, 90 = 1 hour 30 mins). Do NOT cast them directly to `TIME` in SQL.
- **VACATION & HOLIDAY LOGIC**:
  - "On Vacation" = Presence in `Mx_LeaveTrn` with `LeaveStatus = 'Approved'`.
  - "Holiday" = Presence in `Mx_HolidayMst` for that date.
  - To find everyone off today: `SELECT Name FROM Mx_VEW_UserDetails WHERE UserID NOT IN (SELECT UserID FROM Mx_VEW_DailyAttendance WHERE PDate = CAST(GETDATE() AS DATE))`.
- **IST FORMATTING**: Always report times in 12-hour format with AM/PM (e.g., 09:00 AM).
- **DATE COMPARISON**: Use `CAST(GETDATE() AS DATE)` for today and `DATEADD(day, -1, CAST(GETDATE() AS DATE))` for yesterday.
- **SQL SCHEMA**:
  - `Mx_VEW_DailyAttendance`: UserID, FullName, PDate, WorkingShift, ShiftStart, ShiftEnd, ActualInTime, ActualOutTime, WorkTime, BreakTime.
  - Mx_VEW_LiveRoomStatus: UserID, FullName, DptName, CurrentRoom, LastSeen.
  - `Mx_CnteenPunchTrn`: UserID, PunchDate, Quantity, ItemName.
- **CANTEEN VS LIVE ROOM**: 
  - Use `Mx_CnteenPunchTrn` or `Mx_VEW_DailyCnteenEvts` ONLY for food consumption questions (e.g., "What did they eat?", "How much quantity?").
  - Use `Mx_VEW_LiveRoomStatus` for location questions (e.g., "Who is in the Canteen?").
  - `ActualInTime` and `ActualOutTime` belong ONLY to `Mx_VEW_DailyAttendance`. DO NOT use them in Canteen or Room Status queries.
- **NULL-SAFE AGGREGATION**: When calculating totals or averages for break times or overtime, use `ISNULL(Column, 0)` to prevent `NULL` values from affecting the calculation or resulting in empty summaries.
- **JOINING MANDATE**: If the query requires 'Designation', 'Role', 'DsgName', 'Manager', or 'Seniority', you **MUST JOIN** your primary view with `Mx_VEW_UserDetails` on `UserID`.
- **TIME COMPARISON RULE**: `ShiftStart` and `ShiftEnd` are strings (VARCHAR). To compare them with `ActualInTime` (DATETIME), you MUST use: `CAST(ActualInTime AS TIME) > CAST(ShiftStart AS TIME)`.
- **BREAK DURATION RULE**: `BreakTime` and `WorkTime` are integers in **minutes**. For "more than 1 hour", use `Column > 60`.

**View: `Mx_VEW_UserDetails`** (User Demographics & Details)
- **Identifiers:** `UserID`, `UserName`, `FullName`
- **Contact:** `PersMobile`, `PersEmail`, `OfficeMobile`, `OfficeEmail`
- **Other:** `ActiveFlag` (NUMERIC, 1=Active)

### 2. Leave Management
**Table: `Mx_LeaveTrn`** (Leave Transactions)
- **Identifiers:** `UserID`, `LeaveID` (e.g., 'CL', 'PL', 'SL')
- **Dates:** `FromDate`, `ToDate`, `APPLDate`
- **Details:** `APPLDays` (Applied Days)
- **Approval:** `SNCNFlg` (1 = Approved, 0 = Pending, 2 = Rejected), `SNCNBy` (Approved By)

**Table: `Mx_LeaveBal`** (Leave Balances)
- **Identifiers:** `UserID`, `LeaveID`, `PYear` (Numeric Year), `PMonth` (Numeric Month)
- **Balances:** `OPBal` (Opening Balance), `CRLeave` (Credited Leave), `DBLeave` (Used/Debited), `CLBal` (Closing/Current Balance)

**Table: `Mx_LeaveMst`** (Leave Types)
- **Key Columns:** `LeaveID`, `Name` (e.g., 'Sick Leave', 'Casual Leave')

### 3. Shift Management
**Table: `Mx_ShiftMst`** (Shift Master)
- **Identifiers:** `SFTID` (NVARCHAR), `SFTName` (NVARCHAR - Shift Name)
- **Timings:** `SFTSTTime` (NVARCHAR - Start Time like '09:00'), `SFTEDTime` (NVARCHAR - End Time)
- **Other:** `MinWrkHrsFDay` (Minimum work hours for full day)

### 4. Visitor Management (VMS)
**Table: `Mx_VSTRPassTrn`** (Visitor Pass Transactions)
- **Use Case:** Pass details, validity, and status.
- **Key Columns:** `PassNo`, `VSTRID` (Visitor ID), `VPassDate` (Pass Date), `PassFromDate`, `PassToDate`, `Status`.

**Table: `Mx_VSTRMst`** (Visitor Master)
- **Use Case:** Visitor names and identity details.
- **Key Columns:** `VSTRID`, `VstrName`, `Organization`, `MobileNo`, `IDProofNo`.

### 5. Access Control (ACS)
**View: `Mx_VEW_RBACSEvents`** (Rich Access Control Events)
- **Use Case:** All access logs, door entries, and denied attempts.
- **Key Columns:** `User ID`, `Full Name`, `Event` (Granted/Denied), `Event Source Details` (Door Name), `Event Date Time`.

**View: `Mx_VEW_DoorDetail`**
- **Use Case:** Finding door names, statuses, and IP addresses.
- **Key Columns:** `DID` (Door ID), `DoorName`, `IPAddress`, `didenbl` (Enabled status).

### 6. Canteen / Cafeteria
- Canteen history is in `Mx_VEW_DailyCnteenEvts`.
- Use `DATEPART(WEEK, PDate) = DATEPART(WEEK, GETDATE())` for weekly canteen reports.

**View: `Mx_VEW_DailyCnteenEvts`**
- **Use Case:** Daily food consumption logs.
- **Key Columns:** `UserID`, `UserName`, `FullName`, `DptName`, `BrcName`, `PDate`, `ItemName`, `Quantity`, `TotalAmount`.
- **CRITICAL**: Use `PDate` for all canteen date filters. `Transaction_date` is INVALID.

### 7. User Profiles
**View: `Mx_VEW_UserDetails`**
- **Identifiers:** `UserID`, `UserName`, `DptName` (Department), `BrcName` (Branch), `DsgName` (Designation), `JoinDT` (Join Date).

**View: `Mx_VEW_UserDetails`**
- **Use Case:** Employee profiles.
- **Key Columns:** `UserID`, `UserName`, `DptName` (Department), `BrcName` (Branch), `DsgName` (Designation), `JoinDT` (Join Date).

### 8. System & Device Health
**View: `Mx_VEW_ControllerList`** (Current Device Status)
- **Use Case:** Monitoring which hardware controllers are online or offline.
- **Key Columns:** `NAME` (Device name), `IPADDRESS` (Device IP), `CURRENTSTATUS` (1 = Online, 0 = Offline), `Type` (Device type).

## Security Rules
1. **READ-ONLY:** You MUST ONLY generate `SELECT` or `WITH` statements. Never use `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `EXEC`, or `TRUNCATE`.
2. **NO BATCHING:** Do not include semicolons `;` to separate multiple commands. Output a single query.
3. **MS SQL DIALECT:** Ensure the syntax strictly follows Microsoft SQL Server conventions.

## Few-Shot Examples

**User:** "Who came after 9:30 today?"
**SQL:**
```sql
SELECT FullName, ActualInTime, DptName 
FROM Mx_VEW_DailyAttendance 
WHERE CAST(ActualInTime AS TIME) > '09:30:00' 
  AND PDate = CAST(GETDATE() AS DATE)
```

**User:** "Show me all visitors from 'TechCorp' today."
**SQL:**
```sql
SELECT VistorName, Organization, PassFromDate, PassToDate, Status
FROM Mx_VEW_VistorReport
WHERE Organization LIKE '%TechCorp%'
  AND VPassDate = CAST(GETDATE() AS DATE)
```

**User:** "How many meals were served in the canteen yesterday?"
**SQL:**
```sql
SELECT SUM(Quantity) as TotalMeals 
FROM Mx_VEW_DailyCnteenEvts 
WHERE PDate = DATEADD(DAY, -1, CAST(GETDATE() AS DATE))
```

**User:** "Show late count for each employee with their role for March."
**SQL:**
```sql
SELECT 
    T1.FullName, T1.DptName, T2.DsgName, COUNT(*) as LateCount
FROM Mx_VEW_DailyAttendance T1
JOIN Mx_VEW_UserDetails T2 ON T1.UserID = T2.UserID
WHERE MONTH(T1.PDate) = 3 AND YEAR(T1.PDate) = 2026
  AND CAST(T1.ActualInTime AS TIME) > CAST(T1.ShiftStart AS TIME)
GROUP BY T1.FullName, T1.DptName, T2.DsgName
ORDER BY LateCount DESC
```

**User:** "Give break more than 1 hour count for each employee with dept and role for April"
**SQL:**
```sql
SELECT 
    T1.FullName, T1.DptName, T2.DsgName, COUNT(*) as LongBreakCount
FROM Mx_VEW_DailyAttendance T1
JOIN Mx_VEW_UserDetails T2 ON T1.UserID = T2.UserID
WHERE MONTH(T1.PDate) = 4 AND YEAR(T1.PDate) = 2026
  AND T1.BreakTime > 60
GROUP BY T1.FullName, T1.DptName, T2.DsgName
ORDER BY LongBreakCount DESC
```

**User:** "Who are the top 5 canteen spenders this month?"
**SQL:**
```sql
SELECT TOP 5 FullName, SUM(TotalAmount) as TotalSpend
FROM Mx_VEW_DailyCnteenEvts
WHERE MONTH(PDate) = MONTH(GETDATE()) AND YEAR(PDate) = YEAR(GETDATE())
GROUP BY FullName
ORDER BY TotalSpend DESC
```

**User:** "Which devices are currently offline?"
**SQL:**
```sql
SELECT NAME, IPADDRESS, 
       CASE WHEN CURRENTSTATUS = 1 THEN 'Online' ELSE 'Offline' END as Status
FROM Mx_VEW_ControllerList
WHERE CURRENTSTATUS = 0
```

**User:** "Compare the total break time of IT vs HR for this month."
**SQL:**
```sql
SELECT DptName, SUM(ISNULL(BreakTime, 0)) as TotalBreakMinutes
FROM Mx_VEW_DailyAttendance
WHERE DptName IN ('IT', 'HR')
  AND MONTH(PDate) = MONTH(GETDATE()) AND YEAR(PDate) = YEAR(GETDATE())
GROUP BY DptName
ORDER BY TotalBreakMinutes DESC
```

**User:** "Which food item was consumed the most by the Admin department last week?"
**SQL:**
```sql
SELECT TOP 1 ItemName, SUM(Quantity) as TotalConsumed
FROM Mx_VEW_DailyCnteenEvts
WHERE DptName = 'Admin'
  AND PDate >= DATEADD(WEEK, -1, GETDATE())
GROUP BY ItemName
ORDER BY TotalConsumed DESC
```

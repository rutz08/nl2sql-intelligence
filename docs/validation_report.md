# SAHAY COSEC Intelligence: Master Validation Report

This document compiles all test queries executed against the NL2SQL Agent across all validation phases. For failed queries, the database error is provided.

## Overall Success Rate: 29 / 90 (32.2%)

### 1. Who arrived after 9:30 AM today?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT FullName, ActualInTime, DptName 
FROM Mx_VEW_DailyAttendance 
WHERE CAST(ActualInTime AS TIME) > '09:30:00' 
  AND PDate = CAST(GETDATE() AS DATE)
```

**[UI Snapshot - AI Answer]**
> I couldn't find any records matching your request.

---

### 2. List the employees who worked less than 5 hours yesterday.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 4093, Requested 3531. Please try again in 16.239999999s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 3. Show me the attendance trend for Employee 1 for this month.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2884, Requested 3657. Please try again in 5.41s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 4. Who has the highest total work time this week?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 FullName, SUM(WorkTime) as TotalWorkTime 
FROM Mx_VEW_DailyAttendance 
WHERE PDate >= CAST(DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()), 0) AS DATE) 
GROUP BY FullName 
ORDER BY TotalWorkTime DESC
```

**[UI Snapshot - AI Answer]**
> Employee 11 has the highest total work time this week with 990 minutes.

---

### 5. List all employees who were absent yesterday.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 4068, Requested 3652. Please try again in 17.2s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 6. What was the average arrival time for the IT department last week?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2859, Requested 3487. Please try again in 3.46s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 7. Who are the top 5 employees with the most overtime this month?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3269, Requested 3488. Please try again in 7.57s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 8. Show me the daily logs for user1 for the last 7 days.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 4706, Requested 3489. Please try again in 21.95s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 9. Which department has the best 'on-time' arrival record this month?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3497, Requested 3658. Please try again in 11.55s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 10. List all employees who haven't punched out yet today.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT FullName 
FROM Mx_VEW_DailyAttendance 
WHERE ActualOutTime IS NULL 
  AND PDate = CAST(GETDATE() AS DATE)
```

**[UI Snapshot - AI Answer]**
> I couldn't find any records matching your request.

---

### 11. Which department employees take more breaks?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2950, Requested 3481. Please try again in 4.31s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 12. Who had the longest break time yesterday?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 FullName, BreakTime_HHMM 
FROM Mx_VEW_DailyAttendance 
WHERE CAST(PDate AS DATE) = DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) 
ORDER BY BreakTime DESC
```

**[UI Snapshot - AI Answer]**
> "Employee 1 had the longest break time yesterday, with a break of 1 hour and 30 minutes."

---

### 13. Show me the break start and end times for Employee 2 for the last week.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 4126, Requested 3491. Please try again in 16.17s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 14. Give me a list of employees who took a break longer than 90 minutes today.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2915, Requested 3536. Please try again in 4.51s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 15. What is the average break duration for the HR department this month?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT AVG(BreakTime) 
FROM Mx_VEW_DailyAttendance 
WHERE DptName LIKE '%HR%' 
  AND MONTH(PDate) = MONTH(GETDATE()) 
  AND YEAR(PDate) = YEAR(GETDATE())
```

**[UI Snapshot - AI Answer]**
> The average break duration for the HR department this month is 90 minutes.

---

### 16. Which employee took more than 3 breaks in a single day last week?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3063, Requested 3643. Please try again in 7.06s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 17. Show the trend of break times for the Admin department over the last 30 days.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3259, Requested 3491. Please try again in 7.5s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 18. Who had the shortest break yesterday?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT FullName, BreakTime_HHMM 
FROM Mx_VEW_DailyAttendance 
WHERE CAST(PDate AS DATE) = DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) 
  AND BreakTime < (SELECT MIN(BreakTime) FROM Mx_VEW_DailyAttendance WHERE CAST(PDate AS DATE) = DATEADD(DAY, -1, CAST(GETDATE() AS DATE)))
```

**[UI Snapshot - AI Answer]**
> I couldn't find any records matching your request.

---

### 19. List employees who went on break before 12:30 PM today.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 4467, Requested 3634. Please try again in 21.01s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 20. Compare the total break time of IT vs HR for this month.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3264, Requested 3532. Please try again in 7.959999999s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 21. Who is in MD Cabin right now?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 5689, Requested 3527. Please try again in 32.16s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 22. Which employees are currently in the Server Room?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2819, Requested 3483. Please try again in 3.02s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 23. List everyone currently located in the R&D Lab.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT UserID, FullName 
FROM Mx_VEW_LiveRoomStatus 
WHERE CurrentRoom LIKE '%R&D Lab%'
```

**[UI Snapshot - AI Answer]**
> You have 5 colleagues currently located in the R&D Lab: Employee 6, Employee 7, Employee 8, Employee 9, and Employee 10.

---

### 24. How many people are in the Finance Office today?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3893, Requested 3484. Please try again in 13.77s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 25. What was the last seen location of Employee 5?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2683, Requested 3485. Please try again in 1.68s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 26. Who entered the Server Room after 6:00 PM yesterday?
**Status:** ❌ FAIL

**Error Details:**
```text
Invalid column name 'Full Name'.
```

---

### 27. Which room is currently the most occupied?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 3720, Requested 3606. Please try again in 13.26s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 28. List all access granted events for the Main Gate today.
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 2516, Requested 3530. Please try again in 459.999999ms. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 29. Who is currently in the HR Department room?
**Status:** ❌ FAIL

**Error Details:**
```text
Groq API Error: {"error":{"message":"Rate limit reached for model `llama-3.1-8b-instant` in organization `org_01kfyrtjdmf3k81g2yd2rdaf00` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Used 4794, Requested 3528. Please try again in 23.22s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing","type":"tokens","code":"rate_limit_exceeded"}}
```

---

### 30. Show me the movement history of Employee 1 between different rooms today.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C61A50>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 31. How many visitors are expected today?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C630D0>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 32. List all visitors who are currently checked in.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C57B90>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 33. Who was the host for the visitor 'John Smith' yesterday?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C63210>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 34. Show me all visitors from 'Matrix' for this month.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C807D0>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 35. Which visitor has stayed the longest in the premises today?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C82B50>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 36. List all 'Access Denied' events for visitors this week.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C8CF10>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 37. What was the purpose of visit for the visitor at the Finance Office today?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C81790>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 38. Show me the check-in trend for visitors for the last 3 months.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228CEAB43D0>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 39. How many visitor passes were issued yesterday?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C55250>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 40. List visitors who haven't checked out yet.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C62710>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 41. What is the total canteen spend for the IT department this month?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C8F350>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 42. Which food item was consumed the most yesterday?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C63FD0>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 43. How many meals were served in the canteen today?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C57310>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 44. Show me the daily canteen transactions for Employee 1 for this month.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C80810>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 45. What is the total revenue from the canteen for the last 30 days?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C8D5D0>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 46. Which department has the highest canteen usage?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228CEAB4410>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 47. List all employees who consumed 'Lunch' today.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C82CD0>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 48. What is the top spending employee in canteen this month?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C3F290>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 49. What is the average cost per meal this month?
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C8E090>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 50. Show me the trend of canteen consumption for the last 6 months.
**Status:** ❌ FAIL

**Error Details:**
```text
HTTPConnectionPool(host='localhost', port=3000): Max retries exceeded with url: /api/nl2sql (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x00000228D0C62D10>: Failed to establish a new connection: [WinError 10061] No connection could be made because the target machine actively refused it'))
```

---

### 51. List any employees who have canteen punches on days they were marked 'Absent'.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT DISTINCT DA.UserID, DA.UserName, DA.FullName
FROM Mx_VEW_DailyAttendance DA
INNER JOIN Mx_VEW_DailyCnteenEvts CE ON DA.UserID = CE.UserID AND DA.PDate = CE.PDate
WHERE DA.WorkTime = 0
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 52. Find 'Ghost Visitors': Visitors who checked in but have no corresponding room movement records.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT V.[VistorName], V.[EntryDT], V.[Status]
FROM Mx_VEW_VistorReport V
LEFT JOIN Mx_VEW_LiveRoomStatus L ON V.[VistorName] = L.[FullName]
WHERE V.[Status] IN ('Checked In', 'Checked Out')
  AND L.[UserID] IS NULL
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 53. Which employees have multiple 'Access Denied' events followed by a successful 'Access Granted' in another room?
**Status:** ❌ FAIL

**Error Details:**
```text
Invalid column name 'EventSourceDetails'.
```

---

### 54. Identify any room that had more than 10 entries within a 5-minute window today.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT [CurrentRoom], COUNT(*) as EntryCount
FROM Mx_VEW_LiveRoomStatus
WHERE CAST([LastSeen] AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY [CurrentRoom]
HAVING COUNT(*) > 10
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 55. List employees who checked out early (before 4 PM) but stayed in a room for more than 7 hours.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT DA.FullName, DA.ActualOutTime, LRS.CurrentRoom, 
       DATEDIFF(HOUR, LRS.LastSeen, DA.ActualOutTime) as RoomStayHours
FROM Mx_VEW_DailyAttendance DA
JOIN Mx_VEW_LiveRoomStatus LRS ON DA.UserID = LRS.UserID
WHERE CAST(DA.ActualOutTime AS TIME) < '16:00:00'
  AND DATEDIFF(HOUR, LRS.LastSeen, DA.ActualOutTime) > 7
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 56. Rank departments by 'Overtime vs Canteen Usage' ratio for this month.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
WITH OvertimeCTE AS (
  SELECT DptName, 
         SUM(CASE WHEN WorkTime > 540 THEN WorkTime - 540 ELSE 0 END) / 60.0 as TotalOvertimeHours
  FROM Mx_VEW_DailyAttendance
  WHERE YEAR(PDate) = YEAR(GETDATE()) AND MONTH(PDate) = MONTH(GETDATE())
  GROUP BY DptName
),
CanteenCTE AS (
  SELECT DptName, 
         SUM(Quantity) as TotalItemsConsumed
  FROM Mx_VEW_DailyCnteenEvts
  WHERE YEAR(PDate) = YEAR(GETDATE()) AND MONTH(PDate) = MONTH(GETDATE())
  GROUP BY DptName
)
SELECT COALESCE(O.DptName, C.DptName) as DptName,
       COALESCE(O.TotalOvertimeHours, 0) as TotalOvertimeHours,
       COALESCE(C.TotalItemsConsumed, 0) as TotalItemsConsumed,
       CASE 
         WHEN COALESCE(C.TotalItemsConsumed, 0) = 0 THEN NULL 
         ELSE COALESCE(O.TotalOvertimeHours, 0) / COALESCE(C.TotalItemsConsumed, 0) 
       END as OvertimeToCanteenRatio
FROM OvertimeCTE O
FULL OUTER JOIN CanteenCTE C ON O.DptName = C.DptName
ORDER BY OvertimeToCanteenRatio DESC;
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 57. What is the total building occupancy (Employees + Visitors) for every hour of the day today?
**Status:** ❌ FAIL

**Error Details:**
```text
Security Violation: Multiple statements are not allowed.
```

---

### 58. Compare the average 'Late Arrival' time of the Finance department vs the HR department.
**Status:** ❌ FAIL

**Error Details:**
```text
The data types datetime and time are incompatible in the greater than operator.
```

---

### 59. Which host handles the most visitors while having more than 8 hours of work time daily?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 H.FullName, COUNT(V.EntryID) as TotalVisitors
FROM Mx_VEW_VistorReport V
JOIN Mx_VEW_UserDetails H ON V.HostName = H.FullName
JOIN Mx_VEW_DailyAttendance A ON H.UserID = A.UserID
WHERE A.WorkTime > 480
GROUP BY H.FullName
ORDER BY TotalVisitors DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 60. Show the total number of unique employees who entered the 'Server Room' vs 'MD Cabin' this week.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT 
    [CurrentRoom], 
    COUNT(DISTINCT [UserID]) as UniqueEmployees
FROM 
    Mx_VEW_LiveRoomStatus
WHERE 
    [CurrentRoom] IN ('Server Room', 'MD Cabin')
    AND DATEPART(WEEK, [LastSeen]) = DATEPART(WEEK, GETDATE())
GROUP BY 
    [CurrentRoom]
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 61. Which employee has the highest ratio of break time to work time this month?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 FullName, 
             CAST(BreakTime AS FLOAT) / WorkTime AS BreakToWorkRatio
FROM Mx_VEW_DailyAttendance
WHERE MONTH(PDate) = MONTH(GETDATE()) AND YEAR(PDate) = YEAR(GETDATE())
  AND WorkTime > 0
ORDER BY BreakToWorkRatio DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 62. Find employees who arrived late more than 3 times this week but still completed their total required work hours.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
WITH LateComers AS (
  SELECT UserID, COUNT(*) as LateCount
  FROM Mx_VEW_DailyAttendance
  WHERE CAST(ActualInTime AS TIME) > CAST(ShiftStart AS TIME)
    AND DATEPART(WEEK, PDate) = DATEPART(WEEK, GETDATE())
    AND DATEPART(YEAR, PDate) = DATEPART(YEAR, GETDATE())
  GROUP BY UserID
  HAVING COUNT(*) > 3
),
RequiredWorkHours AS (
  SELECT UserID, SUM(WorkTime) as TotalWorkTime
  FROM Mx_VEW_DailyAttendance
  WHERE DATEPART(WEEK, PDate) = DATEPART(WEEK, GETDATE())
    AND DATEPART(YEAR, PDate) = DATEPART(YEAR, GETDATE())
  GROUP BY UserID
  HAVING SUM(WorkTime) >= 540 * 5  -- assuming 5 days in a week and 540 minutes per day
)
SELECT DISTINCT L.UserID, U.FullName
FROM LateComers L
JOIN Mx_VEW_UserDetails U ON L.UserID = U.UserID
JOIN RequiredWorkHours R ON L.UserID = R.UserID
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 63. List the departments where the average canteen spend is greater than the company average.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT DptName, AVG(TotalAmount) as AverageSpend
FROM Mx_VEW_DailyCnteenEvts
GROUP BY DptName
HAVING AVG(TotalAmount) > (SELECT AVG(TotalAmount) FROM Mx_VEW_DailyCnteenEvts)
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 64. Who are the top 3 hosts with the longest average visitor stay duration?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 3 HostName, AVG(DATEDIFF(MINUTE, EntryDT, ExitDT)) as AverageStayDuration
FROM Mx_VEW_VistorReport
GROUP BY HostName
ORDER BY AverageStayDuration DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 65. Identify any employee who was present for less than 4 hours but consumed more than 2 canteen items.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT DA.FullName, DA.WorkTime, 
       CE.Quantity, CE.PDate
FROM Mx_VEW_DailyAttendance DA
JOIN Mx_VEW_DailyCnteenEvts CE 
    ON DA.UserID = CE.UserID AND 
       CAST(DA.PDate AS DATE) = CAST(CE.PDate AS DATE)
WHERE DA.WorkTime < 240 
  AND CE.Quantity > 2;
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 66. Show me the correlation between late arrivals and canteen usage for the IT department this month.
**Status:** ❌ FAIL

**Error Details:**
```text
The data types datetime and time are incompatible in the greater than operator.
```

---

### 67. Which room has the highest number of unique visitors (not employees) today?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 [CurrentRoom], COUNT(DISTINCT [UserID]) as UniqueVisitors
FROM Mx_VEW_LiveRoomStatus
WHERE [CurrentRoom] IS NOT NULL
  AND CAST([LastSeen] AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY [CurrentRoom]
ORDER BY UniqueVisitors DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 68. List employees who have 'Access Denied' events at the Server Room but have never been in the IT department.
**Status:** ❌ FAIL

**Error Details:**
```text
Invalid column name 'FullName'.
```

---

### 69. What is the most frequent purpose of visit for guests staying longer than 2 hours?
**Status:** ❌ FAIL

**Error Details:**
```text
Security Violation: Query must start with SELECT or WITH.
```

---

### 70. Find the employee who has the most inconsistent arrival times (highest variance) this month.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 FullName, 
       AVG(DATEDIFF(MINUTE, 0, CAST(ActualInTime AS TIME))) as AverageArrivalTime, 
       MAX(DATEDIFF(MINUTE, 0, CAST(ActualInTime AS TIME))) - MIN(DATEDIFF(MINUTE, 0, CAST(ActualInTime AS TIME))) as TimeVariance
FROM Mx_VEW_DailyAttendance
WHERE MONTH(PDate) = MONTH(GETDATE()) AND YEAR(PDate) = YEAR(GETDATE())
GROUP BY FullName
ORDER BY TimeVariance DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 71. Which department has the most employees leaving early (before ShiftEnd) on Fridays?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT DptName, COUNT(UserID) as TotalEmployees
FROM Mx_VEW_DailyAttendance
WHERE CAST(ActualInTime AS TIME) > CAST(ShiftEnd AS TIME)
  AND DATEDIFF(WEEKDAY, PDate, GETDATE()) = 5
GROUP BY DptName
ORDER BY TotalEmployees DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 72. Show the total canteen revenue generated by employees who worked overtime yesterday.
**Status:** ❌ FAIL

**Error Details:**
```text
Security Violation: Query must start with SELECT or WITH.
```

---

### 73. Identify any 'Access Denied' events that occurred within 10 minutes of a visitor checking in to the same host.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT 
  [User ID], 
  [Full Name], 
  [Event], 
  [Event Source Details], 
  [Event Date Time]
FROM 
  Mx_VEW_RBACSEvents
WHERE 
  [Event] = 'Access Denied'
  AND [Event Date Time] BETWEEN 
    (SELECT [EntryDT] FROM Mx_VEW_VistorReport WHERE [Status] = 'Checked In' AND [HostName] = [User ID]) 
    AND DATEADD(MINUTE, 10, (SELECT [EntryDT] FROM Mx_VEW_VistorReport WHERE [Status] = 'Checked In' AND [HostName] = [User ID]))
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 74. Which shift has the highest average break time?
**Status:** ❌ FAIL

**Error Details:**
```text
[object Object]
```

---

### 75. List employees who have never used the canteen but have over 200 hours of work time this month.
**Status:** ❌ FAIL

**Error Details:**
```text
Security Violation: Query must start with SELECT or WITH.
```

---

### 76. What is the average number of room transitions per employee in the Marketing department today?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT AVG(DATEDIFF(MINUTE, LastSeen, LastSeen)) as AverageRoomTransitionTime
FROM Mx_VEW_LiveRoomStatus
WHERE DptName = 'Marketing'
  AND CurrentRoom IS NOT NULL
  AND CAST(LastSeen AS DATE) = CAST(GETDATE() AS DATE)
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 77. Find visitors who checked out after their host had already left for the day.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT VistorName, HostName, ExitDT, Status
FROM Mx_VEW_VistorReport
WHERE ExitDT > (SELECT MAX(ActualOutTime) 
                FROM Mx_VEW_DailyAttendance 
                WHERE PDate = CAST(GETDATE() AS DATE))
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 78. Which day of the week has the highest average building occupancy?
**Status:** ❌ FAIL

**Error Details:**
```text
Invalid column name 'PDate'.
```

---

### 79. Compare the total break time of employees who arrived on time vs those who arrived late.
**Status:** ❌ FAIL

**Error Details:**
```text
[object Object]
```

---

### 80. Identify employees who visited the 'R&D Lab' and then immediately visited the 'Server Room'.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT DISTINCT a.UserID, a.FullName, a.DptName, a.CurrentRoom
FROM Mx_VEW_LiveRoomStatus a
INNER JOIN Mx_VEW_LiveRoomStatus b
ON a.UserID = b.UserID
WHERE a.CurrentRoom = 'R&D Lab'
  AND b.CurrentRoom = 'Server Room'
  AND a.LastSeen > b.LastSeen
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 81. What is the average time between an employee's ActualInTime and their first canteen punch?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT SUM(Quantity) as TotalMeals 
FROM Mx_VEW_DailyCnteenEvts 
WHERE PDate = DATEADD(DAY, -1, CAST(GETDATE() AS DATE))
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 82. List the top 5 most frequently visited rooms by employees who have 'Manager' in their designation.
**Status:** ❌ FAIL

**Error Details:**
```text
Invalid column name 'DsgName'.
```

---

### 83. Which host had visitors from the most unique companies this month?
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 HostName, COUNT(DISTINCT CompanyName) as UniqueCompanies
FROM Mx_VEW_VistorReport
WHERE MONTH(EntryDT) = MONTH(GETDATE()) AND YEAR(EntryDT) = YEAR(GETDATE())
GROUP BY HostName
ORDER BY UniqueCompanies DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 84. Show the average work time for employees based on the number of canteen items they consume.
**Status:** ❌ FAIL

**Error Details:**
```text
Explicit conversion from data type int to time is not allowed.
```

---

### 85. Identify employees who have an 'Access Granted' event but no ActualInTime punch for the day.
**Status:** ❌ FAIL

**Error Details:**
```text
Security Violation: Query must start with SELECT or WITH.
```

---

### 86. What percentage of total canteen revenue comes from the top 10% of spenders?
**Status:** ❌ FAIL

**Error Details:**
```text
The ORDER BY clause is invalid in views, inline functions, derived tables, subqueries, and common table expressions, unless TOP, OFFSET or FOR XML is also specified.
```

---

### 87. List employees who took breaks totaling exactly their allowed break time.
**Status:** ❌ FAIL

**Error Details:**
```text
[object Object]
```

---

### 88. Which department has the highest ratio of visitors to employees today?
**Status:** ❌ FAIL

**Error Details:**
```text
Security Violation: Query must start with SELECT or WITH.
```

---

### 89. Find the longest continuous time an employee spent in a single room other than their assigned department.
**Status:** ✅ PASS

**[UI Snapshot - Generated SQL]**
```sql
SELECT TOP 1 
       [UserID], 
       [FullName], 
       [DptName], 
       [CurrentRoom], 
       DATEDIFF(MINUTE, [LastSeen], LAG([LastSeen], 1, [LastSeen]) OVER (PARTITION BY [UserID] ORDER BY [LastSeen])) as LongestTime
FROM 
       [Mx_VEW_LiveRoomStatus]
WHERE 
       [CurrentRoom] NOT IN (SELECT [DptName] FROM [Mx_VEW_UserDetails])
ORDER BY 
       LongestTime DESC
```

**[UI Snapshot - AI Answer]**
> Data table returned successfully.

---

### 90. Compare the average canteen spend on days with overtime vs days without overtime.
**Status:** ❌ FAIL

**Error Details:**
```text
[object Object]
```

---


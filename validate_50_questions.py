import requests
import json
import time

url = "http://localhost:3000/api/nl2sql"
headers = {"Content-Type": "application/json"}

questions = [
    # 1. Attendance & Productivity
    "Who arrived after 9:30 AM today?",
    "List the employees who worked less than 5 hours yesterday.",
    "Show me the attendance trend for Employee 1 for this month.",
    "Who has the highest total work time this week?",
    "List all employees who were absent yesterday.",
    "What was the average arrival time for the IT department last week?",
    "Who are the top 5 employees with the most overtime this month?",
    "Show me the daily logs for user1 for the last 7 days.",
    "Which department has the best 'on-time' arrival record this month?",
    "List all employees who haven't punched out yet today.",
    
    # 2. Break & Multi-Punch
    "Which department employees take more breaks?",
    "Who had the longest break time yesterday?",
    "Show me the break start and end times for Employee 2 for the last week.",
    "Give me a list of employees who took a break longer than 90 minutes today.",
    "What is the average break duration for the HR department this month?",
    "Which employee took more than 3 breaks in a single day last week?",
    "Show the trend of break times for the Admin department over the last 30 days.",
    "Who had the shortest break yesterday?",
    "List employees who went on break before 12:30 PM today.",
    "Compare the total break time of IT vs HR for this month.",

    # 3. Real-Time Room Presence
    "Who is in MD Cabin right now?",
    "Which employees are currently in the Server Room?",
    "List everyone currently located in the R&D Lab.",
    "How many people are in the Finance Office today?",
    "What was the last seen location of Employee 5?",
    "Who entered the Server Room after 6:00 PM yesterday?",
    "Which room is currently the most occupied?",
    "List all access granted events for the Main Gate today.",
    "Who is currently in the HR Department room?",
    "Show me the movement history of Employee 1 between different rooms today.",

    # 4. Visitor Management
    "How many visitors are expected today?",
    "List all visitors who are currently checked in.",
    "Who was the host for the visitor 'John Smith' yesterday?",
    "Show me all visitors from 'Matrix' for this month.",
    "Which visitor has stayed the longest in the premises today?",
    "List all 'Access Denied' events for visitors this week.",
    "What was the purpose of visit for the visitor at the Finance Office today?",
    "Show me the check-in trend for visitors for the last 3 months.",
    "How many visitor passes were issued yesterday?",
    "List visitors who haven't checked out yet.",

    # 5. Canteen
    "What is the total canteen spend for the IT department this month?",
    "Which food item was consumed the most yesterday?",
    "How many meals were served in the canteen today?",
    "Show me the daily canteen transactions for Employee 1 for this month.",
    "What is the total revenue from the canteen for the last 30 days?",
    "Which department has the highest canteen usage?",
    "List all employees who consumed 'Lunch' today.",
    "What is the top spending employee in canteen this month?",
    "What is the average cost per meal this month?",
    "Show me the trend of canteen consumption for the last 6 months."
]

results = []

for i, q in enumerate(questions):
    print(f"[{i+1}/50] Testing: {q}")
    try:
        response = requests.post(url, data=json.dumps({"prompt": q}), headers=headers)
        res_json = response.json()
        
        if response.status_code == 200 and res_json.get("success"):
            status = "PASS"
            results.append({
                "id": i+1,
                "question": q,
                "status": "PASS",
                "query": res_json.get("queryExecuted", "N/A"),
                "answer": res_json.get("humanAnswer", "N/A")
            })
        else:
            status = "FAIL"
            err_msg = res_json.get("details", str(res_json.get("error", "Unknown Error")))
            results.append({
                "id": i+1,
                "question": q,
                "status": "FAIL",
                "error": err_msg
            })
    except Exception as e:
        results.append({"id": i+1, "question": q, "status": "ERROR", "error": str(e)})
    
    # Save incrementally
    with open("final_50_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    time.sleep(45) 

print("\n--- FINAL TEST COMPLETE ---")
print(f"Total: {len(results)}, Passed: {len([r for r in results if r['status'] == 'PASS'])}")

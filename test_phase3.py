import requests
import json
import time

url = "http://localhost:3000/api/nl2sql"
headers = {"Content-Type": "application/json"}

questions = [
    "List any employees who have canteen punches on days they were marked 'Absent'.",
    "Find 'Ghost Visitors': Visitors who checked in but have no corresponding room movement records.",
    "Which employees have multiple 'Access Denied' events followed by a successful 'Access Granted' in another room?",
    "Identify any room that had more than 10 entries within a 5-minute window today.",
    "List employees who checked out early (before 4 PM) but stayed in a room for more than 7 hours.",
    "Rank departments by 'Overtime vs Canteen Usage' ratio for this month.",
    "What is the total building occupancy (Employees + Visitors) for every hour of the day today?",
    "Compare the average 'Late Arrival' time of the Finance department vs the HR department.",
    "Which host handles the most visitors while having more than 8 hours of work time daily?",
    "Show the total number of unique employees who entered the 'Server Room' vs 'MD Cabin' this week."
]

results = []

for i, q in enumerate(questions):
    print(f"[{i+1}/10] Testing: {q}")
    try:
        response = requests.post(url, data=json.dumps({"prompt": q}), headers=headers)
        res_json = response.json()
        
        if response.status_code == 200 and res_json.get("success"):
            status = "PASS"
            results.append({
                "id": i+1,
                "question": q,
                "status": "PASS",
                "query": res_json.get("queryExecuted", "N/A")
            })
            print(f"  -> PASS")
        else:
            status = "FAIL"
            err_msg = res_json.get("details", str(res_json.get("error", "Unknown Error")))
            results.append({
                "id": i+1,
                "question": q,
                "status": "FAIL",
                "error": err_msg
            })
            print(f"  -> FAIL: {err_msg}")
    except Exception as e:
        results.append({"id": i+1, "question": q, "status": "ERROR", "error": str(e)})
        print(f"  -> ERROR: {str(e)}")
    
    with open("phase3_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    # 45 second delay to stay within Groq rate limits
    time.sleep(45) 

print("\n--- PHASE 3 BATCH 3 & 4 TEST COMPLETE ---")
print(f"Total: {len(results)}, Passed: {len([r for r in results if r['status'] == 'PASS'])}")

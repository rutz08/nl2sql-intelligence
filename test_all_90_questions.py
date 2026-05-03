import requests
import json
import time
import os

url = "http://localhost:3000/api/nl2sql"
headers = {"Content-Type": "application/json"}

# Read the 90 unique questions from the Desktop file
desktop_path = r"C:\Users\ANT PC\Desktop\sahay_all_tested_questions.md"
questions = []

with open(desktop_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines:
        line = line.strip()
        # Parse numbered list items (e.g. "1. What is the...")
        if line and line[0].isdigit() and '. ' in line:
            q = line.split('. ', 1)[1]
            questions.append(q)

print(f"Loaded {len(questions)} questions. Starting 5x Multi-Key test run...")

results = []

for i, q in enumerate(questions):
    print(f"[{i+1}/{len(questions)}] {q}")
    try:
        response = requests.post(url, data=json.dumps({"prompt": q}), headers=headers)
        res_json = response.json()
        
        if response.status_code == 200 and res_json.get("success"):
            results.append({
                "id": i+1,
                "question": q,
                "status": "PASS",
                "query": res_json.get("queryExecuted", "N/A"),
                "answer": res_json.get("humanAnswer", "N/A")
            })
            print(f"  -> PASS")
        else:
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
    
    # Save incrementally so we don't lose data
    with open("final_90_results.json", "w", encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    # 6-second delay = 10 requests per minute total.
    # Across 5 separate API keys, this is exactly 2 requests per minute per key.
    # 2 requests * 2500 tokens = 5000 TPM (safely under Groq's 6000 TPM free tier limit).
    time.sleep(6)

print("\n--- FINAL 90 QUERY RUN COMPLETE ---")
passed = len([r for r in results if r['status'] == 'PASS'])
print(f"Total: {len(results)}, Passed: {passed}, Failed: {len(results) - passed}")

# Generate Final Desktop Report
content = f'# SAHAY COSEC Intelligence: The Final 90-Query 5-Key Test Run\n\n'
content += f'**Total Score:** {passed} / {len(results)} Passed\n\n---\n\n'

for r in results:
    content += f'### Question {r["id"]}: {r["question"]}\n'
    content += f'**Status:** {r["status"]}\n\n'
    if r["status"] == "PASS":
        content += f'**Generated SQL:**\n```sql\n{r.get("query", "")}\n```\n\n'
        content += f'**AI Answer:**\n> {r.get("answer", "")}\n\n'
    else:
        content += f'**Error:**\n```text\n{r.get("error", "")}\n```\n\n'
    content += '---\n\n'

out_path = r'C:\Users\ANT PC\Desktop\sahay_final_90_results.md'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Full markdown report saved to: {out_path}")

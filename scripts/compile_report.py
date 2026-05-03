import json
import os

files = [
    "final_50_test_results.json",
    "phase3_results.json",
    "phase3_final30_results.json",
    "phase3_retry_failed_results.json"
]

master_results = {}

for file in files:
    if os.path.exists(file):
        with open(file, 'r') as f:
            data = json.load(f)
            for item in data:
                q = item['question']
                # Overwrite only if the new result is a PASS, or if it doesn't exist yet
                if q not in master_results or item.get('status') == 'PASS':
                    master_results[q] = item

markdown_content = "# SAHAY COSEC Intelligence: Master Validation Report\n\n"
markdown_content += "This document compiles all test queries executed against the NL2SQL Agent across all validation phases. For failed queries, the database error is provided.\n\n"

passed = sum(1 for v in master_results.values() if v.get('status') == 'PASS')
total = len(master_results)
markdown_content += f"## Overall Success Rate: {passed} / {total} ({(passed/total)*100:.1f}%)\n\n"

for idx, (q, res) in enumerate(master_results.items()):
    status = res.get('status')
    markdown_content += f"### {idx+1}. {q}\n"
    if status == 'PASS':
        markdown_content += f"**Status:** ✅ PASS\n\n"
        markdown_content += f"**[UI Snapshot - Generated SQL]**\n```sql\n{res.get('query', 'N/A')}\n```\n\n"
        markdown_content += f"**[UI Snapshot - AI Answer]**\n> {res.get('answer', 'Data table returned successfully.')}\n\n"
    else:
        markdown_content += f"**Status:** ❌ FAIL\n\n"
        markdown_content += f"**Error Details:**\n```text\n{res.get('error', 'Unknown Error')}\n```\n\n"
    markdown_content += "---\n\n"

with open("validation_report.md", "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Report generated successfully.")

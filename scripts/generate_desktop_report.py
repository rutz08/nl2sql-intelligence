import json
import os

files = [
    'final_50_test_results.json',
    'phase3_results.json',
    'phase3_final30_results.json',
    'phase3_retry_failed_results.json'
]

master_results = {}
for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                q = item['question']
                if q not in master_results or item.get('status') == 'PASS':
                    master_results[q] = item

content = '# SAHAY COSEC Intelligence: Full Test Results Analysis\n\n'
for idx, (q, res) in enumerate(master_results.items()):
    status = res.get('status')
    content += f'### Question {idx+1}: {q}\n'
    content += f'**Status:** {status}\n\n'
    if status == 'PASS':
        query_val = res.get('query', '')
        ans_val = res.get('answer', '')
        content += f'**Generated SQL:**\n```sql\n{query_val}\n```\n\n'
        content += f'**AI Answer:**\n> {ans_val}\n\n'
    else:
        err_val = res.get('error', '')
        content += f'**Error:**\n```text\n{err_val}\n```\n\n'
    content += '---\n\n'

desktop_path = r'C:\Users\ANT PC\Desktop\sahay_test_results.md'
with open(desktop_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Generated file at: {desktop_path}')

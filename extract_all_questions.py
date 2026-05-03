import json
import os

files = [
    'test_results.json',           # Phase 1
    'final_50_test_results.json',  # Phase 2
    'phase3_results.json',         # Phase 3 (Part 1)
    'phase3_final30_results.json'  # Phase 3 (Part 2)
]

all_questions = []
seen = set()

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                q = item['question']
                if q not in seen:
                    seen.add(q)
                    all_questions.append(q)

content = '# SAHAY COSEC Intelligence: All 150 Tested Questions\n\n'
for idx, q in enumerate(all_questions):
    content += f'{idx+1}. {q}\n'

desktop_path = r'C:\Users\ANT PC\Desktop\sahay_all_150_questions.md'
with open(desktop_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Extracted {len(all_questions)} unique questions.')
print(f'Saved to: {desktop_path}')

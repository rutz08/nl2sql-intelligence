import json
import re

with open('validate_50_questions.py', 'r') as f:
    content = f.read()

# Match strings starting with " and ending with ", possibly followed by a comma
matches = re.findall(r'"([^"]+)"', content)
# Filter for questions (they usually end with ?)
questions = [m for m in matches if '?' in m or 'List' in m or 'Show' in m or 'Who' in m or 'What' in m]

# Keep only 50
questions = questions[:50]

with open('questions_to_test.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f"Extracted {len(questions)} questions.")

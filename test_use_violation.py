import requests
import json

url = "http://localhost:3000/api/nl2sql"
headers = {"Content-Type": "application/json"}

prompts = [
    "what is the attendance of user 12 for last week?",
    "what is the attendance of userid 12 for last week?"
]

for p in prompts:
    print(f"Testing: {p}")
    response = requests.post(url, data=json.dumps({"prompt": p}), headers=headers)
    print(json.dumps(response.json(), indent=2))
    print("-" * 50)

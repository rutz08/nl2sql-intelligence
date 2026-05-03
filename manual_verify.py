import requests
import json

url = "http://localhost:3000/api/nl2sql"
headers = {"Content-Type": "application/json"}

manual_tests = [
    "top 5 spender in canteen this week?"
]

for q in manual_tests:
    print(f"\n--- Testing: {q} ---")
    response = requests.post(url, data=json.dumps({"prompt": q}), headers=headers)
    print(json.dumps(response.json(), indent=2))

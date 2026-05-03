import requests
import json

url = "http://localhost:3000/api/nl2sql"
headers = {"Content-Type": "application/json"}

prompt = "Find the longest continuous time an employee spent in a single room other than their assigned department."

print(f"Testing: {prompt}")
try:
    response = requests.post(url, data=json.dumps({"prompt": prompt}), headers=headers)
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Request failed: {e}")

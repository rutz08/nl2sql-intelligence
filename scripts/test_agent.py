import requests
import json

url = "http://localhost:3000/api/nl2sql"
payload = {"prompt": "List all visitors who are currently checked in."}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")

import os
import json
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY_1")
SCHEMA_FILE = "discovered_schema.json"
OUTPUT_FILE = "join_training_data.jsonl"
QUESTIONS_PER_PAIR = 20

client = Groq(api_key=GROQ_API_KEY)

# Define logical table pairs for JOINs
JOIN_PAIRS = [
    ("Mx_VEW_DailyAttendance", "Mx_VEW_UserDetails"),
    ("Mx_VEW_DailyCnteenEvts", "Mx_VEW_UserDetails"),
    ("Mx_VEW_RBACSEvents", "Mx_VEW_DoorDetail"),
    ("Mx_VEW_RBACSEvents", "Mx_VEW_UserDetails"),
    ("Mx_LeaveTrn", "Mx_VEW_UserDetails"),
    ("Mx_VEW_DailyAttendance", "Mx_VEW_DailyCnteenEvts")
]

def generate_join_questions(table1, table2):
    print(f"Generating JOIN questions for: {table1} + {table2}...")
    
    prompt = f"""
    You are an AI Data Engineer training a Router for a COSEC SQL System.
    Analyze these two tables:
    Table 1: {table1}
    Table 2: {table2}

    TASK:
    Generate exactly {QUESTIONS_PER_PAIR} diverse natural language questions that REQUIRE columns from BOTH tables (a JOIN).
    
    COMMON JOIN SCENARIOS:
    - Asking for data from Table 1 filtered by a role or designation in Table 2.
    - Comparing activity in Table 1 across branches or departments defined in Table 2.
    - Correlating attendance (Table 1) with canteen usage (Table 2).

    RULES:
    1. The target MUST include BOTH tables: ["{table1}", "{table2}"]
    2. Output Format: Strictly JSONL. Each line:
       {{"input": "user question", "target": ["{table1}", "{table2}"]}}
    
    ONLY return JSONL.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"  Error: {e}")
        return ""

def main():
    total_valid = 0
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for t1, t2 in JOIN_PAIRS:
            batch_content = generate_join_questions(t1, t2)
            lines = batch_content.split('\n')
            for line in lines:
                line = line.strip()
                if not line or not line.startswith('{'): continue
                try:
                    json_obj = json.loads(line)
                    f.write(json.dumps(json_obj) + "\n")
                    total_valid += 1
                except: continue
            time.sleep(1.5)

    print(f"\n✅ Complex Join Training Data Generated! Total samples: {total_valid}")

if __name__ == "__main__":
    main()

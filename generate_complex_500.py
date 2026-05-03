import os
import json
import time
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
GROQ_KEYS = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3"),
    os.getenv("GROQ_API_KEY_4"),
    os.getenv("GROQ_API_KEY_5")
]
GROQ_KEYS = [k for k in GROQ_KEYS if k] # Filter out empty keys

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
OUTPUT_FILE = "complex_join_data_500.jsonl"
SAMPLES_TO_GENERATE = 500

current_key_index = 0

# --- Logical Table Groups for Complex Joins ---
COMPLEX_GROUPS = [
    {"tables": ["Mx_VEW_DailyAttendance", "Mx_VEW_UserDetails", "Mx_VEW_DailyCnteenEvts"], "area": "Attendance + Role + Canteen"},
    {"tables": ["Mx_LeaveTrn", "Mx_VEW_UserDetails", "Mx_LeaveMst"], "area": "Leave Management + Demographics"},
    {"tables": ["Mx_VEW_RBACSEvents", "Mx_VEW_DoorDetail", "Mx_VEW_UserDetails"], "area": "Security + Access Control"},
    {"tables": ["Mx_VEW_DailyAttendance", "Mx_VEW_LiveRoomStatus"], "area": "Attendance + Real-time Location"}
]

def call_groq(key, prompt):
    client = Groq(api_key=key)
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=2000
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"      Groq Key {key[:10]}... Error: {e}")
        return None

def call_gemini(key, prompt):
    print("      [Fallback] Attempting Gemini...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={key}"
    headers = {'Content-Type': 'application/json'}
    data = {"contents": [{"parts": [{"text": prompt}]}]}
    try:
        res = requests.post(url, headers=headers, json=data)
        return res.json()['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"      Gemini Error: {e}")
        return None

def generate_batch(tables, area, count):
    global current_key_index
    print(f"--- Generating {count} complex questions for: {area} ---")
    
    prompt = f"""
    You are an AI Data Scientist training an NL2SQL Router.
    TABLES: {', '.join(tables)}

    TASK:
    Generate exactly {count} highly complex natural language questions that require data from ALL of these tables combined.
    
    COMPLEXITY RULES:
    1. Multi-Join: Questions must require joining all {len(tables)} tables.
    2. Logic: Include filters (WHERE), groupings (GROUP BY), and calculations (AVG/SUM).
    3. Context: Focus on corporate analytics (e.g., "Which department has the most late comers who also eat at the canteen?").
    4. Format: Strictly JSONL. Each line:
       {{"input": "user question", "target": {json.dumps(tables)}}}
    
    ONLY return JSONL lines. No talk.
    """

    # Try Groq Round-Robin
    for _ in range(len(GROQ_KEYS)):
        key = GROQ_KEYS[current_key_index]
        current_key_index = (current_key_index + 1) % len(GROQ_KEYS)
        
        result = call_groq(key, prompt)
        if result: return result
        time.sleep(1)

    # Final Fallback to Gemini
    if GEMINI_KEY:
        return call_gemini(GEMINI_KEY, prompt)
    
    return ""

def main():
    total_samples = 0
    batch_size = 25 # Generate 25 per batch to avoid token limits
    batches_needed = SAMPLES_TO_GENERATE // batch_size
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for i in range(batches_needed):
            # Rotate through groups
            group = COMPLEX_GROUPS[i % len(COMPLEX_GROUPS)]
            print(f"Batch {i+1}/{batches_needed}...")
            
            content = generate_batch(group['tables'], group['area'], batch_size)
            if not content: continue
            
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if not line or not line.startswith('{'): continue
                try:
                    json_obj = json.loads(line)
                    f.write(json.dumps(json_obj) + "\n")
                    total_samples += 1
                except: continue
            
            print(f"   Saved {total_samples} samples so far.")
            time.sleep(2) # Small delay to be polite to APIs

    print(f"\nDone! Generated {total_samples} high-complexity samples.")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

import os
import json
import time
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
GROQ_KEYS = [os.getenv(f"GROQ_API_KEY_{i}") for i in range(1, 6) if os.getenv(f"GROQ_API_KEY_{i}")]
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
OUTPUT_FILE = "mixed_data_200.jsonl"
current_key_index = 0

# --- Mixing Strategy ---
STRATEGY = [
    {"type": "Simple", "count": 50, "prompt": "Generate 50 simple, single-table questions for Attendance, Canteen, or UserDetails."},
    {"type": "Analytical", "count": 50, "prompt": "Generate 50 single-table questions requiring complex math like Average, Total Overtime, or Shift counts."},
    {"type": "Multi-Join", "count": 100, "prompt": "Generate 100 high-complexity questions requiring JOINs between Attendance, UserDetails, and CanteenEvents."}
]

def call_api(prompt):
    global current_key_index
    # Try Groq Round-Robin
    for _ in range(len(GROQ_KEYS)):
        key = GROQ_KEYS[current_key_index]
        current_key_index = (current_key_index + 1) % len(GROQ_KEYS)
        try:
            client = Groq(api_key=key)
            res = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8
            )
            return res.choices[0].message.content.strip()
        except: continue
    
    # Fallback to Gemini
    if GEMINI_KEY:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_KEY}"
        try:
            res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            return res.json()['candidates'][0]['content']['parts'][0]['text']
        except: return None
    return None

def main():
    total = 0
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for stage in STRATEGY:
            print(f"Generating {stage['count']} {stage['type']} samples...")
            # We split large batches to avoid token limits
            batch_size = 25
            for i in range(0, stage['count'], batch_size):
                prompt = f"""
                Generate exactly {batch_size} {stage['type']} natural language questions.
                {stage['prompt']}
                
                Format: JSONL. One line per question:
                {{"input": "question", "target": ["Table1", "Table2"]}}
                
                ONLY JSONL output.
                """
                content = call_api(prompt)
                if not content: continue
                for line in content.split('\n'):
                    if line.strip().startswith('{'):
                        try:
                            json.loads(line)
                            f.write(line.strip() + "\n")
                            total += 1
                        except: continue
                time.sleep(2)
    print(f"Done! Saved {total} mixed samples to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

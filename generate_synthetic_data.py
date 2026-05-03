import os
import json
import random
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY_1")
OUTPUT_FILE = "manual_training_data.jsonl"
BATCH_SIZE = 50
TOTAL_GOAL = 500

client = Groq(api_key=GROQ_API_KEY)

AREAS = [
    {"name": "Attendance", "tables": ["Mx_VEW_DailyAttendance"], "keywords": ["Late", "Absent", "Early", "WorkTime"]},
    {"name": "Canteen", "tables": ["Mx_VEW_DailyCnteenEvts"], "keywords": ["Lunch", "Tea", "Spending", "Quantity"]},
    {"name": "Visitors", "tables": ["Mx_VEW_VistorReport", "Mx_VSTRPassTrn"], "keywords": ["Checked In", "Organization", "Mobile"]},
    {"name": "Live Presence & Devices", "tables": ["Mx_VEW_LiveRoomStatus", "Mx_VEW_ControllerList"], "keywords": ["Cabin", "Offline", "Online", "Status"]}
]

def generate_batch(area_info, count):
    print(f"Generating {count} entries for {area_info['name']}...")
    
    prompt = f"""
    Generate {count} unique natural language queries for the COSEC database system.
    Functional Area: {area_info['name']}
    Valid Tables: {area_info['tables']}
    Sample Keywords: {area_info['keywords']}

    RULES:
    1. Diversity: Mix formal requests (e.g., "List all...") with casual ones (e.g., "who's here").
    2. Implicit Queries: Include queries like "MD cabin status" or "Visitor count for yesterday".
    3. Noise: Introduce realistic typos (e.g., 'absnt', 'attendanc', 'pucnhes', 'vistor') in 25% of the entries.
    4. Sequence: Ensure varied query lengths and structures.
    5. Output Format: Strictly JSONL. Each line MUST be a valid JSON object:
       {{"input": "user query string", "target": ["TableName", "Keyword"]}}
    
    ONLY return the JSONL lines. No conversational text.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=4000
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating batch: {e}")
        return ""

def main():
    print(f"Starting Synthetic Data Generation ({TOTAL_GOAL} entries)...")
    
    all_entries = []
    
    # Calculate counts per area
    count_per_area = TOTAL_GOAL // len(AREAS)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for area in AREAS:
            # We split the area target into small batches to avoid context limits
            remaining = count_per_area
            while remaining > 0:
                current_batch_size = min(remaining, BATCH_SIZE)
                batch_content = generate_batch(area, current_batch_size)
                
                # Parse and write to file
                lines = batch_content.split('\n')
                valid_count = 0
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    try:
                        # Validate JSON
                        json_obj = json.loads(line)
                        if "input" in json_obj and "target" in json_obj:
                            f.write(json.dumps(json_obj) + "\n")
                            valid_count += 1
                    except:
                        continue
                
                print(f"  Successfully saved {valid_count} entries.")
                remaining -= valid_count
                
                # Small sleep to respect rate limits
                time.sleep(2)

    print(f"\n✅ Data generation complete! File saved: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

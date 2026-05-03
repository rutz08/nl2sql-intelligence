import os
import json
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY_1")
SCHEMA_FILE = "discovered_schema.json"
OUTPUT_FILE = "comprehensive_training_data.jsonl"
QUESTIONS_PER_TABLE = 10

client = Groq(api_key=GROQ_API_KEY)

def generate_questions_for_table(table_name, columns):
    print(f"Analyzing Table: {table_name} ({len(columns)} columns)...")
    
    col_list = ", ".join([c['column'] for c in columns])
    
    prompt = f"""
    You are an AI Database Researcher. Analyze the following COSEC database table and its columns.
    Table: {table_name}
    Columns: {col_list}

    TASK:
    Generate exactly {QUESTIONS_PER_TABLE} diverse natural language questions that a user might ask which would specifically require this table.
    
    RULES:
    1. Variety: Include formal, shorthand, and casual queries.
    2. Specificity: Use the column names to make the questions realistic (e.g., if there's 'ShiftStart', ask about starting times).
    3. Noise: Add minor typos in 2 of the 10 questions.
    4. Output Format: Strictly JSONL. Each line must be:
       {{"input": "user question", "target": ["{table_name}"]}}
    
    ONLY return the JSONL lines. No explanations.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"  Error for {table_name}: {e}")
        return ""

def main():
    if not os.path.exists(SCHEMA_FILE):
        print(f"Error: {SCHEMA_FILE} not found. Run schema_discovery.js first.")
        return

    with open(SCHEMA_FILE, 'r') as f:
        schema = json.load(f)

    print(f"Starting Comprehensive Data Generation for {len(schema)} tables...")
    
    total_valid = 0
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for table_name, columns in schema.items():
            # Skip system tables or very small ones if necessary
            if len(columns) < 2: continue
            
            batch_content = generate_questions_for_table(table_name, columns)
            
            lines = batch_content.split('\n')
            for line in lines:
                line = line.strip()
                if not line or not line.startswith('{'): continue
                try:
                    # Validate JSON
                    json_obj = json.loads(line)
                    f.write(json.dumps(json_obj) + "\n")
                    total_valid += 1
                except:
                    continue
            
            # Rate limiting safety
            time.sleep(1.5)

    print(f"\n✅ Deep Training Data Generated! Total samples: {total_valid}")
    print(f"File saved: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

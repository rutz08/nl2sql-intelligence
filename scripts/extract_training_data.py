import re
import json
import os

def extract_data(log_file, output_file):
    if not os.path.exists(log_file):
        print(f"Error: {log_file} not found.")
        return

    with open(log_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by the separator
    blocks = content.split('--- [')
    
    training_data = []
    
    # Define known tables for reference (optional, but helps validation)
    # We will extract anything starting with Mx_VEW_
    
    for block in blocks:
        if 'SUCCESS' not in block:
            continue
        
        # Extract Prompt
        prompt_match = re.search(r'PROMPT:\s*(.*)', block)
        if not prompt_match:
            continue
        prompt = prompt_match.group(1).strip()
        
        # Extract SQL
        sql_match = re.search(r'SQL:\s*(.*)', block)
        if not sql_match:
            continue
        sql = sql_match.group(1).strip()
        
        # Extract Mx_VEW_ tables
        tables = list(set(re.findall(r'Mx_VEW_\w+', sql)))
        
        if tables:
            training_data.append({
                "input": prompt,
                "target": tables
            })

    with open(output_file, 'w', encoding='utf-8') as f:
        for entry in training_data:
            f.write(json.dumps(entry) + '\n')
            
    print(f"Extracted {len(training_data)} samples to {output_file}")

if __name__ == "__main__":
    extract_data('query_analysis.log', 'lstm_training_data.jsonl')

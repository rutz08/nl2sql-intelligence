import json
import os

schema_file = 'discovered_schema.json'
output_file = 'universal_diversity_data.jsonl'

if not os.path.exists(schema_file):
    print("Schema file not found!")
    exit()

with open(schema_file, 'r') as f:
    schema = json.load(f)

tables = list(schema.keys())
print(f"Generating samples for {len(tables)} tables...")

samples = []

# Template generator for diverse questions
for table in tables:
    # 1. Simple fetch
    samples.append({"input": f"Show me all records from {table}.", "target": [table]})
    samples.append({"input": f"List every entry in the {table} table.", "target": [table]})
    
    # 2. Column-aware (pick first 2 columns)
    cols = [c['column'] for c in schema[table][:2]]
    if len(cols) >= 1:
        samples.append({"input": f"Get {cols[0]} from {table}.", "target": [table]})
    if len(cols) >= 2:
        samples.append({"input": f"Show {cols[0]} and {cols[1]} for all entries in {table}.", "target": [table]})
    
    # 3. Join-aware (Join with UserDetails if it has UserID)
    has_userid = any(c['column'].lower() == 'userid' for c in schema[table])
    if has_userid and table != "Mx_VEW_UserDetails":
        samples.append({"input": f"Show {table} records joined with employee names.", "target": [table, "Mx_VEW_UserDetails"]})
        samples.append({"input": f"Who is the person associated with this {table} record?", "target": [table, "Mx_VEW_UserDetails"]})

    # 4. Contextual keywords (heuristics)
    low_table = table.lower()
    if "vistor" in low_table or "vstr" in low_table or "visitor" in low_table:
        samples.append({"input": "Show me the visitor log.", "target": [table]})
        samples.append({"input": "Who visited us today?", "target": [table]})
    if "door" in low_table:
        samples.append({"input": "Which doors are open?", "target": [table]})
        samples.append({"input": "North gate status report.", "target": [table]})
    if "leave" in low_table:
        samples.append({"input": "Check my leave balance.", "target": [table]})
        samples.append({"input": "Who is on vacation?", "target": [table]})

with open(output_file, 'w', encoding='utf-8') as out:
    for s in samples:
        out.write(json.dumps(s) + "\n")

print(f"Done! Created {len(samples)} universal diversity samples.")

import json
import os

allowed_prefixes = ["Mx_", "Mx_VEW_"]
# Tables that we definitely want to keep even if they don't have the prefix
manual_keep = ["Canteen", "Attendance", "UserDetails"] 

training_files = [
    "mixed_data_200.jsonl",
    "complex_join_data_500.jsonl",
    "comprehensive_training_data.jsonl",
    "join_training_data.jsonl",
    "lstm_training_data.jsonl",
    "manual_training_data.jsonl"
]

total_deleted = 0
total_kept = 0

for input_file in training_files:
    if not os.path.exists(input_file):
        continue
    
    output_file = input_file + ".clean"
    kept_in_file = 0
    deleted_in_file = 0
    
    with open(input_file, 'r', encoding='utf-8') as f, open(output_file, 'w', encoding='utf-8') as out:
        for line in f:
            try:
                data = json.loads(line)
                # Check if all targets are in the allowed list
                is_clean = True
                for t in data['target']:
                    if not any(t.startswith(p) for p in allowed_prefixes) and t not in manual_keep:
                        is_clean = False
                        break
                
                if is_clean:
                    out.write(line)
                    kept_in_file += 1
                else:
                    deleted_in_file += 1
            except:
                continue
    
    print(f"File {input_file}: Kept {kept_in_file}, Deleted {deleted_in_file} dirty samples.")
    total_kept += kept_in_file
    total_deleted += deleted_in_file
    os.replace(output_file, input_file)

print(f"\nPurge Complete! Total Kept: {total_kept}, Total Deleted: {total_deleted}")

import json
import os

mapping = {
    "Attendance": "Mx_VEW_DailyAttendance",
    "Canteen": "Mx_VEW_DailyCnteenEvts",
    "UserDetails": "Mx_VEW_UserDetails",
    "CanteenEvents": "Mx_VEW_DailyCnteenEvts",
    "Department_Sales": "Mx_VEW_UserDetails",  # Best guess mapping
    "Employee_Salaries": "Mx_VEW_UserDetails",
    "Employee_Hours": "Mx_VEW_DailyAttendance",
    "Employee_Departments": "Mx_VEW_UserDetails",
    "Employee_Shifts": "Mx_VEW_DailyAttendance",
    "Employee_Tenure": "Mx_VEW_UserDetails",
    "Employee_Age": "Mx_VEW_UserDetails",
    "Employee_Benefits": "Mx_VEW_UserDetails",
    "Employee_Leaves": "Mx_VEW_DailyAttendance",
    "Employee_Training": "Mx_VEW_UserDetails",
    "Employee_Performance": "Mx_VEW_UserDetails",
    "Employee_Education": "Mx_VEW_UserDetails",
    "Employee_Status": "Mx_VEW_UserDetails",
    "Employee_Promotions": "Mx_VEW_UserDetails",
    "Employee_Resignations": "Mx_VEW_UserDetails",
    "Employee_Experience": "Mx_VEW_UserDetails",
    "Employee_Terminations": "Mx_VEW_UserDetails",
    "Employee_Expenses": "Mx_VEW_UserDetails",
    "Employee_Sick_Leave_Records": "Mx_VEW_DailyAttendance",
    "Product_Sales_Data": "Mx_VEW_DailyCnteenEvts", # Fallback
}

training_files = [
    "mixed_data_200.jsonl",
    "complex_join_data_500.jsonl",
    "comprehensive_training_data.jsonl",
    "join_training_data.jsonl",
    "lstm_training_data.jsonl",
    "manual_training_data.jsonl"
]

for input_file in training_files:
    if not os.path.exists(input_file):
        continue
    
    output_file = input_file + ".tmp"
    fixed_count = 0
    with open(input_file, 'r') as f, open(output_file, 'w') as out:
        for line in f:
            try:
                data = json.loads(line)
                new_targets = []
                for t in data['target']:
                    if t in mapping:
                        new_targets.append(mapping[t])
                    else:
                        new_targets.append(t)
                data['target'] = list(set(new_targets))
                out.write(json.dumps(data) + "\n")
                fixed_count += 1
            except:
                continue
    
    print(f"Fixed {fixed_count} samples in {input_file}.")
    os.replace(output_file, input_file)

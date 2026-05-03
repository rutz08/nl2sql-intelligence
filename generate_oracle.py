import json
import os
import random

# All labels from the current model
labels = [
    "Mx_ACSEventTrn", "Mx_BranchMst", "Mx_BrcMst", "Mx_CategoryMst", "Mx_CnteenPunchTrn", 
    "Mx_ControllerMst", "Mx_CustomGroup1Mst", "Mx_CustomGroup2Mst", "Mx_CustomGroup3Mst", 
    "Mx_DailyAttendance", "Mx_DepartmentMst", "Mx_DesignationMst", "Mx_DptMst", "Mx_DsgMst", 
    "Mx_GradeMst", "Mx_LeaveBal", "Mx_LeaveMst", "Mx_LeaveTrn", "Mx_MasterControllerBasicCfg", 
    "Mx_MasterControllerNwkCfg", "Mx_OrganizationMst", "Mx_RegionMst", "Mx_SectionMst", 
    "Mx_ShiftMst", "Mx_UserDetails", "Mx_UserGroupMst", "Mx_VEW_DailyAttendance", 
    "Mx_VEW_DailyCnteenEvts", "Mx_VEW_LiveRoomStatus", "Mx_VEW_MnthlyCnteenEvts", 
    "Mx_VEW_VistorReport", "Mx_VistorEntry", "Mx_VistorMst", "Mx_HolidayMst",
    "Mx_VEW_ControllerList", "Mx_VEW_DoorDetail", "Mx_VEW_RBACSEvents", 
    "Mx_VEW_RBMonthlyATDSummary", "Mx_VEW_RBYearlyATDSummary"
]

output_file = 'oracle_expansion_1200.jsonl'
samples = []

# 1. Random Permutation Generator (Joins)
for i in range(1200):
    # Pick 1, 2, or 3 random tables
    num_tables = random.choice([1, 2, 3])
    targets = random.sample(labels, num_tables)
    
    # Generate a generic but relevant input
    table_names = " and ".join([t.replace("Mx_", "").replace("VEW_", "") for t in targets])
    input_text = f"Show me information from {table_names} for last quarter."
    
    # Add variations
    variations = [
        f"Analyze data from {table_names}.",
        f"Get details for {table_names} combined.",
        f"Summary of {table_names}.",
        f"Join {table_names} for a report."
    ]
    input_text = random.choice(variations)
    
    samples.append({"input": input_text, "target": targets})

with open(output_file, 'w', encoding='utf-8') as out:
    for s in samples:
        out.write(json.dumps(s) + "\n")

print(f"Created {len(samples)} oracle expansion samples.")

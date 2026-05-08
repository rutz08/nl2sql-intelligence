import json
import random

# Base template from the successful log
# PROMPT: give me attendance of april month. i want all the user row wise with name and user id, i want daily work time in hh:mm column wise for all the proper dates of the month, and horizontal total per user for month and vertical total for all user per date. make sure all the work time is in HH:MM

templates = [
    "give me attendance of {month} {year}. i want all the user row wise with name and user id, i want daily work time in hh:mm column wise for all the proper dates of the month, and horizontal total per user for month and vertical total for all user per date. make sure all the work time is in HH:MM",
    "generate a pivot report for {month} {year} attendance. rows should be users with names and ids. columns should be dates. cells should be work duration in HH:MM. include row totals and column totals.",
    "monthly attendance sheet for {month} {year} with daily hours. show user id and name. calculate total per user and total per day. format as HH:MM.",
    "i need a horizontal attendance summary for {month}. include every date as a column. show work hours for each person. add summary row and column for totals. use Mx_VEW_DailyAttendance.",
    "show daily attendance hours for {month} {year} for all employees. format columns by date. include user info and month-end totals.",
    "attendance matrix for {month}. vertical axis: employees. horizontal axis: days of the month. value: work time (HH:MM). include total row and total column.",
    "get me a full month report of {month} attendance logs. use daily work time. pivot dates to columns. include aggregate totals for both axes.",
    "can i have the attendance grid for {month}? i want to see daily work hours for everyone, plus a final total for the month and a total for each day.",
    "build a table for {month} attendance. rows: [User ID], [Name]. columns: [Dates 1 to 31]. data: [WorkTime HH:MM]. include horizontal/vertical totals.",
    "pivot attendance data for {month} by user. show daily working hours in HH:MM. add sum of hours at the end of each row and bottom of each column."
]

months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
years = ["2026", "2025"]

data = []

# Target tables for these complex joins
targets = ["Mx_VEW_UserDetails", "Mx_VEW_DailyAttendance"]

for i in range(100):
    template = random.choice(templates)
    month = random.choice(months)
    year = random.choice(years)
    prompt = template.format(month=month, year=year)
    data.append({
        "input": prompt,
        "target": targets
    })

output_file = "c:/Users/ANT PC/Desktop/cosec lib/nl2sql_agent_ml/data/complex_join_success_100.jsonl"
with open(output_file, 'w', encoding='utf-8') as f:
    for entry in data:
        f.write(json.dumps(entry) + '\n')

print(f"Generated 100 complex join questions in {output_file}")

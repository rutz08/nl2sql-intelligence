import json
import time
import os
from playwright.sync_api import sync_playwright

def run_qa_test():
    # Load questions
    questions_path = r'c:\Users\ANT PC\Desktop\cosec lib\nl2sql_agent_ml\data\results\questions_to_test.json'
    with open(questions_path, 'r') as f:
        questions = json.load(f)

    results = []
    
    with sync_playwright() as p:
        print("Launching browser for QA testing...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            print("Connecting to http://127.0.0.1:3000...")
            page.goto('http://127.0.0.1:3000', timeout=60000)
            print("Page reached. Waiting 20s for Babel compilation...")
            page.wait_for_timeout(20000) 
            page.wait_for_load_state('networkidle')
            # Ensure input is ready
            page.wait_for_selector('input[type="text"]', state='visible', timeout=30000)
            print("Page loaded and input is visible.")
        except Exception as e:
            print(f"Failed to connect to server: {e}")
            return

        for i, q in enumerate(questions):
            print(f"Testing Question {i+1}/{len(questions)}: {q}")
            
            # Type question
            page.fill('input[type="text"]', q)
            time.sleep(0.5)
            
            # Click send
            page.click('button[type="submit"]')
            
            # Wait for response (look for the "thinking" indicator to disappear or new message to appear)
            # We wait for the results table or an error message
            try:
                # Wait for either a table or an error message, or the 'thinking' message to disappear
                page.wait_for_selector('.animate-pulse', state='hidden', timeout=30000)
                
                # Analyze the last message
                last_msg = page.locator('.animate-in').last
                
                # Check for error
                error_locator = last_msg.locator('.text-red-500')
                has_error = error_locator.count() > 0
                
                status = "FAIL" if has_error else "PASS"
                error_text = error_locator.inner_text() if has_error else ""
                
                # Check for table
                has_table = last_msg.locator('table').count() > 0
                
                results.append({
                    "id": i + 1,
                    "question": q,
                    "status": status,
                    "error": error_text,
                    "has_table": has_table
                })
                
                print(f"   Result: {status}")
                
            except Exception as e:
                print(f"   Timeout or error during question {i+1}: {e}")
                results.append({
                    "id": i + 1,
                    "question": q,
                    "status": "TIMEOUT",
                    "error": str(e),
                    "has_table": False
                })

            # User requested delay between questions
            time.sleep(2)

        browser.close()

    # Generate Report
    report_path = r'c:\Users\ANT PC\Desktop\cosec lib\nl2sql_agent_ml\data\results\qa_test_report.md'
    with open(report_path, 'w') as f:
        f.write("# QA Test Report: 50 Mixed Questions\n\n")
        f.write(f"**Date**: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Total Questions**: {len(questions)}\n")
        
        passed = len([r for r in results if r['status'] == 'PASS'])
        failed = len([r for r in results if r['status'] == 'FAIL'])
        timeouts = len([r for r in results if r['status'] == 'TIMEOUT'])
        
        f.write(f"**Passed**: {passed}\n")
        f.write(f"**Failed**: {failed}\n")
        f.write(f"**Timeouts**: {timeouts}\n\n")
        
        f.write("## Detailed Results\n\n")
        f.write("| ID | Question | Status | Data Table? | Error Details |\n")
        f.write("|----|----------|--------|-------------|---------------|\n")
        for r in results:
            error_disp = r['error'].replace('\n', ' ') if r['error'] else "-"
            f.write(f"| {r['id']} | {r['question']} | {r['status']} | {'Yes' if r['has_table'] else 'No'} | {error_disp} |\n")

    print(f"QA Report generated at: {report_path}")

if __name__ == "__main__":
    run_qa_test()

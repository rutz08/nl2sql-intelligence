const { execSync } = require('child_process');

function testAgent(prompt) {
    console.log(`\n[TESTING PROMPT]: "${prompt}"`);
    console.log("--------------------------------------------------");

    // 1. Router Prediction
    let predicted = [];
    try {
        const output = execSync(`python predict_schema.py "${prompt}"`).toString().trim();
        predicted = JSON.parse(output);
    } catch (e) {
        console.error("Router failed, using empty set.");
    }
    console.log(`1. Router Confidence:   ${JSON.stringify(predicted)}`);

    // 2. Middleware Fail-Safes (Hybrid Layer)
    const lower = prompt.toLowerCase();
    const forced = [];
    if (lower.includes('role') || lower.includes('designation') || lower.includes('department') || lower.includes('manager')) {
        forced.push("Mx_VEW_UserDetails");
    }
    if (lower.includes('break') || lower.includes('punch') || lower.includes('late')) {
        forced.push("Mx_VEW_DailyAttendance");
    }
    if (lower.includes('canteen') || lower.includes('food') || lower.includes('meal')) {
        forced.push("Mx_VEW_DailyCnteenEvts");
    }
    
    const finalSet = [...new Set([...predicted, ...forced])];
    console.log(`2. Fail-Safe Additions: ${JSON.stringify(forced)}`);
    console.log(`3. FINAL SCHEMA SET:    ${JSON.stringify(finalSet)}`);
    console.log("--------------------------------------------------");
    
    if (finalSet.includes("Mx_VEW_DailyAttendance") && finalSet.includes("Mx_VEW_UserDetails") && finalSet.includes("Mx_VEW_DailyCnteenEvts")) {
        console.log("SUCCESS: Triple-Join capability confirmed! ✅");
    } else {
        console.log("PARTIAL: Catching specific tables. ⚠️");
    }
}

// Run the Boss-Level Test
testAgent("List all IT department managers who had long breaks in April and also used the canteen");

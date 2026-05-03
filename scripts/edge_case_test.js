const http = require('http');
const fs = require('fs');
const path = require('path');

const RESULTS_FILE = 'edge_case_results.jsonl';
const DELAY_MS = 15000; // Increased delay to avoid rate limits
const API_URL = 'http://localhost:3000/api/nl2sql';

const EDGE_CASES = [
    "who is here?",                                             // Ambiguity (LSTM target: LiveRoomStatus)
    "what is the attendenc for id 1?",                         // Typos (LSTM target: DailyAttendance)
    "who ate lunch and is also present today?",                // Multi-domain (LSTM target: DailyCnteenEvts, DailyAttendance)
    "anybody left before 10 AM yesterday?",                    // Temporal comparison (LSTM target: DailyAttendance)
    "which visitors came for user ID 5?",                      // Known limitation (LSTM target: VistorReport)
    "show me telemetry for device 'NASA-01'",                  // Non-existent entity (LSTM target: ControllerList)
    "average break time of IT vs Admin this month",            // Complex grouping (LSTM target: DailyAttendance)
    "who was late in a department called 'Magic'?",            // Non-existent department (LSTM target: DailyAttendance)
    "get me the list of guys who didn't punch out today",      // Slang/Natural language (LSTM target: DailyAttendance)
    "Check if view Mx_VEW_VistorEntry exists."                 // System/Meta query (LSTM target: VistorEntry)
];

async function runEdgeCaseTest() {
    console.log(`🚀 Starting Edge-Case Testing Script...`);
    console.log(`Total Scenarios: ${EDGE_CASES.length}`);
    console.log(`Results will be saved to: ${RESULTS_FILE}\n`);

    // Ensure results file is cleared or start fresh
    if (fs.existsSync(path.join(__dirname, RESULTS_FILE))) {
        fs.unlinkSync(path.join(__dirname, RESULTS_FILE));
    }

    for (let i = 0; i < EDGE_CASES.length; i++) {
        const prompt = EDGE_CASES[i];
        console.log(`[Scenario ${i + 1}/${EDGE_CASES.length}] Testing: "${prompt}"`);

        try {
            const result = await sendQuery(prompt);
            const logEntry = {
                timestamp: new Date().toISOString(),
                scenario: i + 1,
                prompt: prompt,
                success: true,
                lstm_router: result.queryExecuted.includes("LSTM") ? "Hints used" : "Standard",
                model: result.modelUsed,
                sql: result.queryExecuted,
                summary: result.humanAnswer
            };
            fs.appendFileSync(path.join(__dirname, RESULTS_FILE), JSON.stringify(logEntry) + '\n', 'utf8');
            console.log(`  ✅ SUCCESS: ${result.modelUsed}`);
            console.log(`  🔍 SQL: ${result.queryExecuted.substring(0, 100)}...`);
        } catch (error) {
            const errEntry = {
                timestamp: new Date().toISOString(),
                scenario: i + 1,
                prompt: prompt,
                success: false,
                error: error.message,
                details: error.details || "N/A"
            };
            fs.appendFileSync(path.join(__dirname, RESULTS_FILE), JSON.stringify(errEntry) + '\n', 'utf8');
            console.error(`  ❌ FAILED: ${error.message}`);
            if (error.details) console.error(`     Details: ${error.details}`);
        }

        if (i < EDGE_CASES.length - 1) {
            console.log(`  🕒 Waiting ${DELAY_MS / 1000}s for next batch...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    console.log(`\n✅ Edge-case testing complete!`);
    console.log(`Analyze ${RESULTS_FILE} for detailed performance metrics.`);
}

function sendQuery(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ prompt: prompt });
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/nl2sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    return reject(new Error(`Invalid JSON response from server.`));
                }

                if (res.statusCode === 200) {
                    resolve(parsed);
                } else {
                    const err = new Error(parsed.error || 'API Error');
                    err.details = parsed.details;
                    reject(err);
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Connection error: ${e.message}`)));
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error("Request Timeout"));
        });
        req.write(data);
        req.end();
    });
}

runEdgeCaseTest();

const http = require('http');
const fs = require('fs');
const path = require('path');

const QUESTIONS_FILE = 'questions_test.json';
const RESULTS_FILE = 'test_results.jsonl';
const DELAY_MS = 12000;
const API_URL = 'http://localhost:3000/api/nl2sql';

async function runTest() {
    const startIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
    const questions = JSON.parse(fs.readFileSync(path.join(__dirname, QUESTIONS_FILE), 'utf8'));
    console.log(`Starting stress test with ${questions.length} questions (starting at index ${startIndex})...`);

    for (let i = startIndex; i < questions.length; i++) {
        const question = questions[i];
        console.log(`[${i + 1}/${questions.length}] Testing: "${question}"`);

        try {
            const result = await sendQuery(question);
            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                index: i + 1,
                question: question,
                success: true,
                model: result.modelUsed,
                sql: result.queryExecuted,
                answer: result.humanAnswer
            });
            fs.appendFileSync(path.join(__dirname, RESULTS_FILE), logEntry + '\n', 'utf8');
            console.log(`  - Success (${result.modelUsed})`);
        } catch (error) {
            const errEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                index: i + 1,
                question: question,
                success: false,
                error: error.message,
                details: error.details
            });
            fs.appendFileSync(path.join(__dirname, RESULTS_FILE), errEntry + '\n', 'utf8');
            
            console.error(`  !! ERROR on question ${i + 1}: ${error.message}`);
            console.log(`\nStopping test for rectification as requested.`);
            console.log(`Please analyze the error, update SHARED_RULES in nl2sql_agent.js, and restart the test.`);
            process.exit(1);
        }

        if (i < questions.length - 1) {
            console.log(`  - Waiting ${DELAY_MS / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    console.log('\nAll tests completed successfully!');
}

function sendQuery(question) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ prompt: question });
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
                    return reject(new Error(`Invalid JSON response: ${body}`));
                }

                if (res.statusCode === 200) {
                    resolve(parsed);
                } else {
                    const err = new Error(parsed.error || 'Request failed');
                    err.details = parsed.details;
                    reject(err);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

runTest();

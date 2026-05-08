/**
 * NL2SQL Agent Express API
 * Converts Natural Language to MS SQL, validates it, and executes it securely.
 */

require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const https = require('https');
const sqlValidator = require('./sql_validator');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve all frontend files including assets

// --- Configuration ---
// 1. Groq API Setup (API Key HA Round-Robin)
const API_KEY_POOL = [
    process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY || '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',
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5
].filter(Boolean); // Keep only keys that are actually provided

let currentKeyIndex = 0;
const TARGET_MODEL = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-1.5-flash"; // Stable version for paid tier
const AI_TIMEOUT = 60000; // 60 second timeout for API calls

// Helper to call Groq API for a specific API Key
function callGroqApi(apiKey, prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: TARGET_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        });

        const options = {
            hostname: 'api.groq.com',
            port: 443,
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                if (res.statusCode === 429) return reject({ status: 429 });
                try {
                    const response = JSON.parse(body);
                    if (response.choices && response.choices.length > 0) {
                        resolve(response.choices[0].message.content);
                    } else {
                        reject(new Error(`Groq API Error: ${JSON.stringify(response)}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error("Groq API Timeout"));
        });
        req.setTimeout(AI_TIMEOUT);
        req.write(data);
        req.end();
    });
}

// Helper to call Gemini API
function callGeminiApi(apiKey, prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        return reject(new Error(`Gemini API Error (Status ${res.statusCode}): ${body}`));
                    }
                    const response = JSON.parse(body);
                    if (response.candidates && response.candidates.length > 0) {
                        resolve(response.candidates[0].content.parts[0].text);
                    } else {
                        reject(new Error(`Gemini API Error (No Candidates): ${JSON.stringify(response)}`));
                    }
                } catch (e) {
                    reject(new Error(`Gemini JSON Parse Error: ${e.message} | Body: ${body}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error("Gemini API Timeout"));
        });
        req.setTimeout(AI_TIMEOUT);
        req.write(data);
        req.end();
    });
}

// Global variable to track the model used in the current request
let lastModelUsed = TARGET_MODEL;

// Primary function with API Key Round-Robin failover + Gemini Fallback
// Primary function with Gemini First + Groq Pool Fallback
async function queryAI(prompt) {
    // 1. Try Gemini First
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            console.log(`[Gemini API]: Attempting with ${GEMINI_MODEL} as primary...`);
            const result = await callGeminiApi(geminiKey, prompt);
            lastModelUsed = GEMINI_MODEL;
            return result;
        } catch (err) {
            console.warn(`[Gemini Error]: Primary failed, falling back to Groq...`, err.message);
            // Fall through to Groq
        }
    }

    // 2. Try Groq Pool Fallback
    if (API_KEY_POOL.length > 0) {
        const startKeyIndex = currentKeyIndex;
        for (let i = 0; i < API_KEY_POOL.length; i++) {
            const keyIndex = (startKeyIndex + i) % API_KEY_POOL.length;
            const apiKey = API_KEY_POOL[keyIndex];
            
            try {
                console.log(`[Groq API]: Attempting Fallback with Key ${keyIndex + 1}/${API_KEY_POOL.length} on ${TARGET_MODEL}...`);
                const result = await callGroqApi(apiKey, prompt);
                
                // Success: advance the round-robin pointer
                currentKeyIndex = (keyIndex + 1) % API_KEY_POOL.length;
                lastModelUsed = TARGET_MODEL;
                return result;
            } catch (err) {
                if (err.status === 429 && i < API_KEY_POOL.length - 1) {
                    console.warn(`[Rate Limit]: Groq Key ${keyIndex + 1} throttled. Failing over to next key...`);
                    continue;
                }
                throw err;
            }
        }
    }

    throw new Error("No working AI provider available.");
}

/**
 * LSTM Router Helper
 * Calls the Python inference script to predict table keywords.
 */
function predictSchema(prompt) {
    try {
        // Sanitize prompt for shell execution
        const sanitizedPrompt = prompt.replace(/"/g, '\\"');
        const scriptPath = path.join(__dirname, '../intelligence/predict_schema.py');
        const result = execSync(`python "${scriptPath}" "${sanitizedPrompt}"`, { encoding: 'utf8', timeout: 5000 });
        const predicted = JSON.parse(result);
        console.log(`[LSTM Router]: Predicted Tables -> ${predicted.join(', ') || 'None'}`);
        return predicted;
    } catch (error) {
        console.error("[LSTM Router Error]:", error.message);
        return [];
    }
}

// --- Database Connection Pool ---
const poolConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'COSEC_DEMO',
    options: {
        encrypt: false, // For local development
        trustServerCertificate: true,
        useUTC: false
    }
};

// Startup Diagnostic: Verify Environment
console.log("--- System Diagnostics ---");
console.log(`Database Target: ${poolConfig.server} -> ${poolConfig.database}`);
console.log(`Gemini API Key: ${process.env.GEMINI_API_KEY ? "DETECTED" : "MISSING"}`);
console.log(`Groq API Keys: ${API_KEY_POOL.length} detected`);
console.log("--------------------------");

let pool;
async function getPool() {
    if (pool && pool.connected) return pool;
    pool = await sql.connect(poolConfig);
    return pool;
}

// Load Schema Skill File
const skillFilePath = path.join(__dirname, '../docs/nl2sql-skill.md');
let systemPromptContext = "";
try {
    systemPromptContext = fs.readFileSync(skillFilePath, 'utf8');
} catch (error) {
    console.warn("Could not load SKILL.md. Falling back to hardcoded schema context.");
}

const SHARED_RULES = `
- **IST NATIVE**: The database and all timestamps are in **IST**. DO NOT perform any UTC conversions in SQL or in your text summaries. Report times exactly as they appear (e.g., if DB says 09:00, report 09:00 AM).
- **SHIFT INTELLIGENCE**: When asked for a specific shift (e.g., 'General shift'), prioritize filtering by the \`WorkingShift\` column (e.g., \`WHERE WorkingShift = 'General'\`). Avoid adding strict time inequalities on \`ActualInTime\` or \`ActualOutTime\` unless the user specifically asks for employees who arrived early or stayed late.
- **EMPLOYEE MAPPING**: When a user mentions "Employee X" (e.g., "Employee 1"), this ALWAYS refers to \`UserID = X\`. In the visitor context (\`Mx_VEW_VistorReport\`), it also refers to \`HostUserID = X\`.
- **TIME FORMATTING**: 
  - \`ActualInTime\` and \`ActualOutTime\` are **DATETIME**. You can use \`FORMAT()\` on them.
  - \`ShiftStart\` and \`ShiftEnd\` are **VARCHAR**. You MUST \`CAST(ShiftStart AS TIME)\` before using \`FORMAT()\` or comparisons.
  - \`FORMAT(CAST(ShiftStart AS TIME), 'hh:mm tt')\` will FAIL. Use \`FORMAT(CAST(ShiftStart AS TIME), 'hh:mm tt')\`.
- **DATE COMPARISON**: Use \`CAST(GETDATE() AS DATE)\` for today and \`DATEADD(day, -1, CAST(GETDATE() AS DATE))\` for yesterday.
- **SQL SCHEMA**:
  - \`Mx_VEW_DailyAttendance\`: UserID, FullName, PDate, WorkingShift, ShiftStart, ShiftEnd, ActualInTime, ActualOutTime, WorkTime, BreakTime.
  - \`Mx_VEW_LiveRoomStatus\`: UserID, FullName, DptName, CurrentRoom, LastSeen.
  - \`Mx_CnteenPunchTrn\`: UserID, PunchDate, Quantity, ItemName.
- **VISITOR LOGIC**: Use 'Mx_VEW_VistorReport' for all visitor queries.
  - **SCHEMA**: PassNo, VistorName, Organization, MobileNo, VPassDate, PassFromDate, PassToDate, Status, HostUserID, HostName.
- **CANTEEN LOGIC**: 
  - **FUZZY MATCHING**: Always use ` + "`" + "LIKE" + "`" + ` with wildcards for ` + "`" + "ItemName" + "`" + ` (e.g., ` + "`" + "WHERE ItemName LIKE '%Lunch%'" + "`" + `).
  - **EXAMPLE**:
    **User:** "Who are the visitors checked in by user ID 1?"
    **SQL:**
    \`\`\`sql
    SELECT VistorName, Organization, PassFromDate, PassToDate, Status
    FROM Mx_VEW_VistorReport
    WHERE Status = 'Checked In'
    \`\`\`
    *(The summary will then explain that host tracking is not available)*
- **GROUP BY RULE**: Whenever you use aggregate functions (e.g., \`COUNT\`, \`SUM\`, \`AVG\`), you MUST include all non-aggregated columns from the \`SELECT\` list in the \`GROUP BY\` clause.
- **CANTEEN LOGIC**: 
  - \`Mx_CnteenPunchTrn\` uses **\`PunchDate\`**.
  - \`Mx_VEW_DailyCnteenEvts\` uses **\`PDate\`**.
  - NEVER use \`Transaction_date\`.
  - **TIME SPENT**: You CANNOT calculate duration spent in the canteen (we only log the food punch time). If asked for "average time spent", explain this and instead show the average time of day when punches occur.
- **SUMMARY INTENT**: If the user asks for a 'summary for all employees', they likely want a list of individual records (one per employee) for that date. Only use aggregation if they ask for totals, counts, or averages across the whole group.
- **UserID INTELLIGENCE**: Parse dotted IDs (1.2.3.4) as individual integers for the SQL 'IN' clause.
- **VISITOR LOGIC**: Use 'Mx_VEW_VistorReport' for all visitor queries. Status values are: 'Expected', 'Checked In', 'Checked Out', 'Exited'. NEVER use raw tables like 'Mx_VSTRPassTrn'.
- **JOINING RULES**:
  - For Attendance: Use 'Mx_VEW_DailyAttendance'.
  - If 'Designation', 'DsgName', or 'Role' is requested: JOIN 'Mx_VEW_DailyAttendance' with 'Mx_VEW_UserDetails' on 'UserID'.
  - 'Mx_VEW_DailyAttendance' has 'DptName' but NO 'DsgName'.
- **INTELLIGENT RECOVERY**: Never show red errors. Handle missing data with helpful explanations.
`;

/**
 * Route: GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

/**
 * Route: POST /api/nl2sql
 */
app.post('/api/nl2sql', async (req, res) => {
    console.log(`[API Request Received]: ${new Date().toISOString()}`);
    let generatedSql = "N/A";
    let userPrompt = "N/A";
    try {
        userPrompt = req.body.prompt;
        if (!userPrompt) {
            return res.status(400).json({ error: "Missing 'prompt' in request body." });
        }

        // Step 0: LSTM Schema Routing
        let predictedKeywords = predictSchema(userPrompt);
        
        // Fail-safe: Manual keyword injection for critical business logic
        const lowerPrompt = userPrompt.toLowerCase();
        
        // 1. User Details Fail-Safe
        if ((lowerPrompt.includes('role') || lowerPrompt.includes('designation') || lowerPrompt.includes('dsg') || lowerPrompt.includes('department') || lowerPrompt.includes('manager')) && !predictedKeywords.includes('Mx_VEW_UserDetails')) {
            console.log("[Middleware Fail-Safe]: Injecting UserDetails hint.");
            predictedKeywords.push('Mx_VEW_UserDetails');
        }

        // 2. Attendance & Breaks Fail-Safe
        if ((lowerPrompt.includes('break') || lowerPrompt.includes('late') || lowerPrompt.includes('early') || lowerPrompt.includes('punch')) && !predictedKeywords.includes('Mx_VEW_DailyAttendance')) {
            console.log("[Middleware Fail-Safe]: Injecting Attendance hint.");
            predictedKeywords.push('Mx_VEW_DailyAttendance');
        }

        // 3. Canteen Usage Fail-Safe
        if ((lowerPrompt.includes('canteen') || lowerPrompt.includes('food') || lowerPrompt.includes('meal')) && !predictedKeywords.includes('Mx_VEW_DailyCnteenEvts')) {
            console.log("[Middleware Fail-Safe]: Injecting Canteen hint.");
            predictedKeywords.push('Mx_VEW_DailyCnteenEvts');
        }

        // 4. Leave & Vacation Fail-Safe
        if ((lowerPrompt.includes('leave') || lowerPrompt.includes('vacation')) && !predictedKeywords.includes('Mx_LeaveTrn')) {
            console.log("[Middleware Fail-Safe]: Injecting Leave hint.");
            predictedKeywords.push('Mx_LeaveTrn');
        }

        // 5. Branch & Location Fail-Safe
        if ((lowerPrompt.includes('branch') || lowerPrompt.includes('location')) && !predictedKeywords.includes('Mx_BranchMst')) {
            console.log("[Middleware Fail-Safe]: Injecting Branch hint.");
            predictedKeywords.push('Mx_BranchMst');
        }

        // 6. Visitor & Security Fail-Safe
        if ((lowerPrompt.includes('visitor') || lowerPrompt.includes('guest') || lowerPrompt.includes('pass')) && !predictedKeywords.includes('Mx_VEW_VistorReport')) {
            console.log("[Middleware Fail-Safe]: Injecting Visitor hint.");
            predictedKeywords.push('Mx_VEW_VistorReport');
        }

        // 7. Doors & Entry Fail-Safe
        if ((lowerPrompt.includes('door') || lowerPrompt.includes('gate') || lowerPrompt.includes('entry')) && (!predictedKeywords.includes('Mx_VEW_DoorDetail') || !predictedKeywords.includes('Mx_ACSEventTrn'))) {
            console.log("[Middleware Fail-Safe]: Injecting Door/ACS hint.");
            if (!predictedKeywords.includes('Mx_VEW_DoorDetail')) predictedKeywords.push('Mx_VEW_DoorDetail');
            if (!predictedKeywords.includes('Mx_ACSEventTrn')) predictedKeywords.push('Mx_ACSEventTrn');
        }

        // 8. Controller & Device Fail-Safe
        if ((lowerPrompt.includes('controller') || lowerPrompt.includes('device')) && !predictedKeywords.includes('Mx_VEW_ControllerList')) {
            console.log("[Middleware Fail-Safe]: Injecting Controller hint.");
            predictedKeywords.push('Mx_VEW_ControllerList');
        }

        // --- NEW: Dynamic Column Injection ---
        let dynamicSchemaDetails = "";
        try {
            const fullSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/discovered_schema.json'), 'utf8'));
            const maxCols = predictedKeywords.length > 4 ? 10 : 100;
            predictedKeywords.forEach(table => {
                if (fullSchema[table]) {
                    const tableCols = fullSchema[table].slice(0, maxCols);
                    const cols = tableCols.map(c => `${c.column} (${c.type})`).join(', ');
                    dynamicSchemaDetails += `\nTABLE: ${table}\nCOLUMNS: ${cols}\n`;
                }
            });
        } catch (e) {
            console.warn("[Schema Injection Error]: Could not load discovered_schema.json");
        }

        const schemaHints = predictedKeywords.length > 0 
            ? `\nLSTM ROUTER PREDICTED TABLES: ${predictedKeywords.join(', ')}\n(Prioritize these tables in your SQL generation. If multiple tables are listed, you MUST use JOIN.)\n\nDETAILED SCHEMA FOR PREDICTED TABLES:${dynamicSchemaDetails}`
            : "";

        // Step 1: Generate SQL from Groq (Llama 3.3 70B)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(Date.now() + istOffset);
        const currentDate = istDate.toISOString().split('T')[0];
        const fullPrompt = `
SYSTEM INSTRUCTIONS (COSEC Intelligence NL2SQL Engine):
You are COSEC Intelligence, the intelligent assistant for Matrix COSEC. 
Your task is to convert Natural Language questions into precise MS SQL queries using the schema provided below.

CURRENT DATE: ${currentDate} (IST context).

SHARED INTELLIGENCE RULES:
${SHARED_RULES}

SCHEMA CONTEXT:
${systemPromptContext}
${schemaHints}

OUTPUT FORMAT:
- Return ONLY the raw SQL query.
- No markdown formatting.
- Ensure all identifiers with spaces are bracketed: [Column Name].

USER REQUEST: ${userPrompt}
`;

        let groqResponse = await queryAI(fullPrompt);
        // Strip any <think> reasoning blocks that newer models generate
        groqResponse = groqResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        generatedSql = "";
        const sqlMatch = groqResponse.match(/```(?:sql)?\s*\n?([\s\S]+?)\n?\s*```/i);
        if (sqlMatch) {
            generatedSql = sqlMatch[1].trim();
        } else {
            // Aggressive fallback: Find first SELECT or WITH (bounded by word boundaries or start of string)
            const selectMatch = groqResponse.match(/(?:\b|^)SELECT\b/i);
            const withMatch = groqResponse.match(/(?:\b|^|;)WITH\b/i);
            
            const selectIndex = selectMatch ? selectMatch.index : -1;
            const withIndex = withMatch ? withMatch.index : -1;
            
            let startIndex = -1;
            if (selectIndex !== -1 && withIndex !== -1) {
                startIndex = Math.min(selectIndex, withIndex);
            } else {
                startIndex = Math.max(selectIndex, withIndex);
            }
            
            if (startIndex !== -1) {
                generatedSql = groqResponse.substring(startIndex).trim();
            } else {
                generatedSql = groqResponse.trim();
            }
        }

        console.log(`[LLM Generated SQL]: ${generatedSql}`);
        
        // --- Middleware Fail-Safe: Remap hallucinated columns ---
        const corrections = {
            'Item_name': 'ItemName',
            'Item_quantity': 'Quantity',
            'VstrID': 'EntryID',
            'Transaction_date': 'PunchDate',
            'Department Name': 'DptName',
            'DeptName': 'DptName',
            'Mx_VEW_DailyAttendanceComplete': 'Mx_VEW_DailyAttendance',
            'Mx_VEW_DailyAttendanceComplete_All': 'Mx_VEW_DailyAttendance',
            'EventSourceDetails': '[Event Source Details]',
            'EventDateTime': '[Event Date Time]',
            'Company': 'CompanyName'
        };
        
        for (const [hallucinated, actual] of Object.entries(corrections)) {
            const regex = new RegExp(`\\b${hallucinated}\\b`, 'gi'); 
            if (regex.test(generatedSql)) {
                console.log(`[Fail-Safe]: Correcting ${hallucinated} -> ${actual}`);
                generatedSql = generatedSql.replace(regex, actual);
            }
        }

        // --- New Syntax Fail-Safe: Fix missing closing brackets in CAST or Aliases ---
        // Handles cases like [D21 AS VARCHAR -> [D21] AS VARCHAR
        generatedSql = generatedSql.replace(/\[([a-zA-Z0-9_]+)\s+AS\s+VARCHAR/gi, '[$1] AS VARCHAR');
        // Handles cases like [D21) -> [D21])
        generatedSql = generatedSql.replace(/\[([a-zA-Z0-9_]+)\)/gi, '[$1])');



        // Step 2: Validate the generated SQL
        const validation = sqlValidator.validate(generatedSql);
        if (!validation.isValid) {
            console.error(`[Validation Failed]: ${validation.error}`);
            return res.status(403).json({ error: validation.error, attemptedSql: generatedSql });
        }

        // Step 3: Execute the query against MS SQL Server
        console.log(`[Database Execution]: Sending SQL to COSEC_DEMO...`);
        const dbPool = await getPool();
        const dbResult = await dbPool.request().query(generatedSql);
        const records = dbResult.recordset;
        console.log(`[Database Execution]: Success. ${records.length} records retrieved.`);

        // Step 4: Generate a Human-Friendly Summary (Prioritizing Gemini)
        console.log(`[Summary Generation]: Requesting summary from Gemini...`);
        
        // --- Date Normalization for AI Summary (Prevent UTC hallucination) ---
        const formattedRecords = records.map(row => {
            const newRow = { ...row };
            for (let key in newRow) {
                if (newRow[key] instanceof Date) {
                    // Convert to local IST-friendly string: YYYY-MM-DD HH:mm:ss
                    const d = newRow[key];
                    const pad = (n) => n.toString().padStart(2, '0');
                    newRow[key] = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                }
            }
            return newRow;
        });

        let humanAnswer = "";
        try {
            // Step 4: Generate Summary (always run for analytical/limitation queries)
            const secondSummaryPrompt = `
SYSTEM: You are a data analyst for COSEC. Summarize the results of the following query.
USER PROMPT: ${userPrompt}
SQL EXECUTED: ${generatedSql}
DATA (JSON): ${JSON.stringify(records.slice(0, 50))}

RULES:
- If data is empty, explain that no matching records were found, but ALSO check if the user asked for something not in the schema (like a Host) and explain that limitation if applicable.
- Keep it concise (2-3 lines).
- Don't mention "JSON" or "Database".
`;
            humanAnswer = await queryAI(secondSummaryPrompt);
            console.log(`[Summary Generation]: Success.`);
        } catch (sErr) {
            console.error(`[Summary Error]:`, sErr);
            humanAnswer = records.length > 0 ? "I've retrieved the data, but I hit a rate limit while generating the summary." : "I couldn't find any records matching your request.";
        }
        
        // Step 5: Return Results to Frontend
        console.log(`[Response]: Sending 200 OK (${lastModelUsed}) with ${records.length} records.`);
        
        // Persistent Post-Analysis Logging
        const successLog = `\n--- [${new Date().toISOString()}] SUCCESS ---\nPROMPT: ${userPrompt}\nMODEL: ${lastModelUsed}\nSQL: ${generatedSql.replace(/\n/g, " ")}\nRECORDS: ${records.length}\n`;
        try { fs.appendFileSync(path.join(__dirname, '../data/query_analysis.log'), successLog, 'utf8'); } catch(e){}

        res.json({
            success: true,
            humanAnswer: humanAnswer.trim(),
            queryExecuted: generatedSql,
            data: records,
            columns: dbResult.recordset.columns ? 
                Object.keys(dbResult.recordset.columns).sort((a, b) => dbResult.recordset.columns[a].index - dbResult.recordset.columns[b].index) : 
                (records.length > 0 ? Object.keys(records[0]) : []),
            modelUsed: lastModelUsed
        });

    } catch (error) {
        console.error(`[Execution Error]:`, error);
        
        // Persistent Post-Analysis Logging
        const errLog = `\n--- [${new Date().toISOString()}] ERROR ---\nPROMPT: ${userPrompt}\nSQL: ${typeof generatedSql !== 'undefined' ? generatedSql : 'N/A'}\nERROR: ${error.message || error}\n`;
        try { fs.appendFileSync(path.join(__dirname, '../data/query_analysis.log'), errLog, 'utf8'); } catch(e){}

        let errorMsg = "An error occurred during query generation or execution.";
        let details = error?.originalError?.info?.message || error?.originalError?.message || error?.message || (typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error));
        
        if (details && details.includes("Rate limit reached")) {
            errorMsg = "API Rate Limit reached. Please wait 30-40 seconds and try again.";
        }
        res.status(500).json({ error: errorMsg, details: details });
    }
});

// Health check endpoint for dashboard and QA scripts
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Serve the frontend dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/react_frontend.html'));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`COSEC Intelligence Dashboard: http://localhost:${port}`);
    console.log(`NL2SQL Agent is running on port ${port}`);
});

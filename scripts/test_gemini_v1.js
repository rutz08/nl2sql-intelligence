require('dotenv').config();
const https = require('https');

function callGeminiApi(apiKey, model, prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1/models/${model}:generateContent?key=${apiKey}`,
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
                resolve({ status: res.statusCode, body: body });
            });
        });
        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

(async () => {
    try {
        const model = 'gemini-1.5-flash';
        console.log(`Testing ${model} with v1...`);
        const res = await callGeminiApi(process.env.GEMINI_API_KEY, model, 'Hello');
        console.log('Result:', res);
    } catch (e) {
        console.error('Test Failed:', e);
    }
})();

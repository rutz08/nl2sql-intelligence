require('dotenv').config();
const https = require('https');

function callGeminiApi(apiKey, prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                console.log('Gemini Status:', res.statusCode);
                resolve(body);
            });
        });
        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

(async () => {
    try {
        console.log('Testing Gemini...');
        const res = await callGeminiApi(process.env.GEMINI_API_KEY, 'Hello');
        console.log('Response:', res);
    } catch (e) {
        console.error('Test Failed:', e);
    }
})();

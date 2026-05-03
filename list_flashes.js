require('dotenv').config();
const https = require('https');

function listModels(apiKey) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models?key=${apiKey}`,
            method: 'GET'
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                resolve(JSON.parse(body));
            });
        });
        req.on('error', (e) => reject(e));
        req.end();
    });
}

(async () => {
    try {
        const res = await listModels(process.env.GEMINI_API_KEY);
        const flashes = res.models.filter(m => m.name.toLowerCase().includes('flash'));
        console.log(JSON.stringify(flashes, null, 2));
    } catch (e) {
        console.error('Test Failed:', e);
    }
})();

const http = require('http');

const data = JSON.stringify({
    prompt: "Summary of Branch Details combined with Leave Applications and the Master Controller list."
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/nl2sql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log("STATUS:", res.statusCode);
        console.log("BODY:", body);
    });
});

req.on('error', (error) => {
    console.error("ERROR:", error.message);
});

req.write(data);
req.end();

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../app/server');

let serverInstance;
let baseUrl;

before(async () => {
    // Start server on an ephemeral port for testing
    await new Promise((resolve) => {
        serverInstance = app.listen(0, () => {
            const port = serverInstance.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });
});

after(async () => {
    await new Promise((resolve) => {
        serverInstance.close(resolve);
    });
});

describe('Cloud Computing & DevOps CI/CD Test Suite', () => {

    test('1. GET /api/health should return HTTP 200 with UP status', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.equal(res.status, 200, 'Health endpoint must respond with 200 OK');
        
        const data = await res.json();
        assert.equal(data.status, 'UP', 'Status must be UP');
        assert.equal(data.service, 'cca2-cicd-app', 'Service identifier must match');
        assert.ok(data.hostname, 'Must include hostname for pod identification');
        assert.ok(data.timestamp, 'Must include timestamp');
    });

    test('2. GET /api/version should return valid version string for CI/CD check', async () => {
        const res = await fetch(`${baseUrl}/api/version`);
        assert.equal(res.status, 200, 'Version endpoint must respond with 200 OK');
        
        const data = await res.json();
        assert.ok(data.version, 'Must return version property');
        // Validates Version 1.0 or Version 2.0 per rubric requirements
        assert.match(
            data.version, 
            /Version (1|2)\.0/, 
            'Version should adhere to Version 1.0 or Version 2.0 format'
        );
        assert.equal(data.metadata.course, 'Cloud Computing & DevOps (CCA-2)');
    });

    test('3. GET /api/info should return host diagnostics and memory telemetry', async () => {
        const res = await fetch(`${baseUrl}/api/info`);
        assert.equal(res.status, 200, 'Info endpoint must respond with 200 OK');
        
        const data = await res.json();
        assert.ok(data.hostname, 'Must provide host/pod name');
        assert.ok(data.platform, 'Must report host platform');
        assert.ok(data.nodeVersion, 'Must report node engine');
        assert.ok(parseFloat(data.memoryRssMb) > 0, 'Memory RSS must be non-zero');
    });

    test('4. GET / serves HTML frontend dashboard with responsive web application', async () => {
        const res = await fetch(`${baseUrl}/`);
        assert.equal(res.status, 200, 'Home page must respond with 200 OK');
        const text = await res.text();
        assert.ok(text.includes('Cloud Computing'), 'Dashboard must contain Cloud Computing section');
        assert.ok(text.includes('DevOps'), 'Dashboard must contain DevOps section');
    });

});

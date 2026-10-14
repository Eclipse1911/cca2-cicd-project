const express = require('express');
const path = require('path');
const os = require('os');
const { APP_VERSION, BUILD_METADATA } = require('./version');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON & serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Healthcheck (Used by Kubernetes Liveness & Readiness Probes and Docker HEALTHCHECK)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'cca2-cicd-app',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        hostname: os.hostname(),
        version: APP_VERSION
    });
});

// API: Version endpoint (Phase 6 Rubric Requirement: Verifies version string)
app.get('/api/version', (req, res) => {
    res.status(200).json({
        version: APP_VERSION,
        metadata: BUILD_METADATA,
        environment: process.env.NODE_ENV || 'production'
    });
});

// API: Diagnostic system info (Evaluators can see live Pod hostname and resource utilization)
app.get('/api/info', (req, res) => {
    const memory = process.memoryUsage();
    res.status(200).json({
        version: APP_VERSION,
        metadata: BUILD_METADATA,
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: (memory.rss / (1024 * 1024)).toFixed(2),
        memoryHeapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(2),
        cpuCount: os.cpus().length,
        loadAverage: os.loadavg(),
        serverTime: new Date().toISOString()
    });
});

// Catch-all route to serve SPA frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server if executed directly
let server;
if (require.main === module) {
    server = app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 CCA-2 Cloud & DevOps App running on port ${PORT}`);
        console.log(`📦 Active Version: ${APP_VERSION}`);
        console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
        console.log(`📊 Info endpoint:   http://localhost:${PORT}/api/info`);
        console.log(`====================================================`);
    });

    // Graceful shutdown for Kubernetes SIGTERM signal
    const gracefulShutdown = (signal) => {
        console.log(`\nReceived ${signal}. Gracefully shutting down...`);
        server.close(() => {
            console.log('HTTP server closed. Exiting process.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = { app };

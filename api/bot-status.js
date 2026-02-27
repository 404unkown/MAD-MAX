const os = require('os');
const uptimeTracker = require('./uptime-tracker');

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Get persistent uptime
    const uptime = uptimeTracker.getUptime();
    
    // Format total uptime
    const totalSeconds = Math.floor(uptime.totalUptimeMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const totalUptimeFormatted = `${days}d ${hours}h ${minutes}m`;
    
    // Format current session uptime
    const sessionSeconds = Math.floor(uptime.sessionUptimeMs / 1000);
    const sessionHours = Math.floor(sessionSeconds / 3600);
    const sessionMinutes = Math.floor((sessionSeconds % 3600) / 60);
    const sessionSeconds_ = sessionSeconds % 60;
    const sessionUptimeFormatted = `${sessionHours}h ${sessionMinutes}m ${sessionSeconds_}s`;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    res.json({
        online: true,
        totalUptime: totalUptimeFormatted,
        currentSession: sessionUptimeFormatted,
        firstStart: new Date(uptime.firstStart).toISOString(),
        memory: usedMemoryMB + 'MB',
        platform: process.platform,
        nodeVersion: process.version,
        restarts: Math.floor(uptime.totalUptimeMs / uptime.sessionUptimeMs) || 1
    });
};
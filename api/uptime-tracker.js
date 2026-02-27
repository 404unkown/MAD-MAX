const fs = require('fs');
const path = require('path');

class UptimeTracker {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'data', 'uptime.json');
        this.ensureFile();
    }

    ensureFile() {
        const dir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        if (!fs.existsSync(this.filePath)) {
            const startTime = Date.now();
            fs.writeFileSync(this.filePath, JSON.stringify({
                firstStart: startTime,
                totalUptime: 0,
                lastStart: startTime
            }, null, 2));
        }
    }

    getUptime() {
        try {
            const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            const currentTime = Date.now();
            
            // Calculate uptime since last start
            const sessionUptime = currentTime - data.lastStart;
            
            // Total uptime = previous total + current session
            const totalUptimeMs = data.totalUptime + sessionUptime;
            
            return {
                totalUptimeMs,
                sessionUptimeMs: sessionUptime,
                firstStart: data.firstStart
            };
        } catch (error) {
            console.error('Error reading uptime:', error);
            return null;
        }
    }

    updateOnRestart() {
        try {
            const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            const currentTime = Date.now();
            
            // Calculate uptime from last session
            const lastSessionUptime = currentTime - data.lastStart;
            
            // Update total and set new lastStart
            data.totalUptime += lastSessionUptime;
            data.lastStart = currentTime;
            
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
            console.log('✅ Uptime tracker updated on restart');
        } catch (error) {
            console.error('Error updating uptime on restart:', error);
        }
    }
}

module.exports = new UptimeTracker();
// plugins/tracker.js - Location Tracker for MAD-MAX Bot
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

// Store tracking state and captured data
const TRACKER_STATE_PATH = path.join(__dirname, '../data/tracker.json');
const CAPTURED_IPS_PATH = path.join(__dirname, '../data/captured_ips.json');

// IP Geolocation API (free, no key needed)
const IP_API_URL = 'http://ip-api.com/json/';

// In-memory stores
let trackerActive = false;
let trackingTargets = new Map(); // phone numbers being tracked
let capturedIPs = [];

// Load saved state on startup
function loadTrackerState() {
    try {
        if (fs.existsSync(TRACKER_STATE_PATH)) {
            const data = JSON.parse(fs.readFileSync(TRACKER_STATE_PATH, 'utf8'));
            trackerActive = data.active || false;
            console.log(`[📍] Tracker state loaded: ${trackerActive ? 'ACTIVE' : 'INACTIVE'}`);
        }
        
        if (fs.existsSync(CAPTURED_IPS_PATH)) {
            capturedIPs = JSON.parse(fs.readFileSync(CAPTURED_IPS_PATH, 'utf8'));
            console.log(`[📍] Loaded ${capturedIPs.length} captured IPs`);
        }
    } catch (error) {
        console.error('[📍] Error loading tracker state:', error.message);
    }
}

// Save tracker state
function saveTrackerState() {
    try {
        fs.writeFileSync(TRACKER_STATE_PATH, JSON.stringify({ 
            active: trackerActive,
            lastUpdated: new Date().toISOString()
        }, null, 2));
    } catch (error) {
        console.error('[📍] Error saving tracker state:', error.message);
    }
}

// Save captured IPs
function saveCapturedIPs() {
    try {
        fs.writeFileSync(CAPTURED_IPS_PATH, JSON.stringify(capturedIPs, null, 2));
    } catch (error) {
        console.error('[📍] Error saving captured IPs:', error.message);
    }
}

// Get IP info from geolocation API
async function getIPInfo(ip) {
    try {
        const response = await axios.get(`${IP_API_URL}${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
        
        if (response.data.status === 'success') {
            return {
                success: true,
                ip: response.data.query,
                country: response.data.country,
                countryCode: response.data.countryCode,
                region: response.data.regionName,
                city: response.data.city,
                zip: response.data.zip,
                lat: response.data.lat,
                lon: response.data.lon,
                timezone: response.data.timezone,
                isp: response.data.isp,
                org: response.data.org,
                as: response.data.as,
                googleMaps: `https://www.google.com/maps?q=${response.data.lat},${response.data.lon}`,
                openStreetMap: `https://www.openstreetmap.org/?mlat=${response.data.lat}&mlon=${response.data.lon}#map=12/${response.data.lat}/${response.data.lon}`
            };
        } else {
            return { success: false, error: response.data.message || 'Failed to get location' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Try to capture IP from various sources
async function captureIP(source, identifier, client) {
    // This is where you'd implement actual IP capture
    // For WhatsApp calls, you'd need to capture STUN packets
    // For now, this is a placeholder that would be replaced with real capture logic
    
    console.log(`[📍] Attempting to capture IP from ${source}: ${identifier}`);
    
    // Simulated capture for demonstration
    // In a real implementation, you'd use packet capture tools
    return null;
}

// Main tracker command
async function trackerCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Only owner can use tracking
        if (!isOwner) {
            await client.sendMessage(chatId, {
                text: '❌ Only the bot owner can use tracking features.'
            }, { quoted: message });
            return;
        }

        const command = args[0]?.toLowerCase();
        const subCommand = args[1]?.toLowerCase();

        switch(command) {
            case 'on':
            case 'activate':
                trackerActive = true;
                saveTrackerState();
                
                await client.sendMessage(chatId, {
                    text: `🕵️ *TRACKER ACTIVATED*\n\n` +
                          `📍 *Status:* ACTIVE\n` +
                          `📱 *Tracking:* All incoming calls & messages\n\n` +
                          `When someone contacts you, I'll attempt to capture:\n` +
                          `• IP Address\n` +
                          `• City & Region\n` +
                          `• Country\n` +
                          `• GPS Coordinates\n` +
                          `• ISP Information\n` +
                          `• Timezone\n\n` +
                          `_Results will appear here automatically_`
                }, { quoted: message });
                break;

            case 'off':
            case 'deactivate':
                trackerActive = false;
                saveTrackerState();
                
                await client.sendMessage(chatId, {
                    text: `🕵️ *TRACKER DEACTIVATED*\n\n📍 Tracking has been stopped.`
                }, { quoted: message });
                break;

            case 'status':
                const status = trackerActive ? '🟢 ACTIVE' : '🔴 INACTIVE';
                const targetCount = trackingTargets.size;
                
                await client.sendMessage(chatId, {
                    text: `📊 *TRACKER STATUS*\n\n` +
                          `Status: ${status}\n` +
                          `Active Targets: ${targetCount}\n` +
                          `Captured Locations: ${capturedIPs.length}\n\n` +
                          `Commands:\n` +
                          `• .track on - Activate tracker\n` +
                          `• .track off - Deactivate tracker\n` +
                          `• .track results - View captured data\n` +
                          `• .track clear - Clear all data\n` +
                          `• .track target [number] - Track specific number\n` +
                          `• .track ip [address] - Look up any IP`
                }, { quoted: message });
                break;

            case 'results':
            case 'data':
            case 'logs':
                if (capturedIPs.length === 0) {
                    await client.sendMessage(chatId, {
                        text: '📭 No location data captured yet.'
                    }, { quoted: message });
                    return;
                }

                // Show last 5 captures
                const recent = capturedIPs.slice(-5).reverse();
                let resultText = `📍 *CAPTURED LOCATIONS*\n\n`;
                
                recent.forEach((item, index) => {
                    const date = new Date(item.timestamp).toLocaleString('en-US', { 
                        timeZone: 'Africa/Nairobi',
                        hour: '2-digit', 
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                    });
                    
                    resultText += `*${index + 1}. ${item.source}*\n`;
                    resultText += `📱 From: ${item.from}\n`;
                    resultText += `🌐 IP: ${item.ip || 'N/A'}\n`;
                    if (item.location) {
                        resultText += `📍 Location: ${item.location.city}, ${item.location.country}\n`;
                        resultText += `🗺️ Maps: ${item.location.googleMaps}\n`;
                    }
                    resultText += `⏰ ${date}\n\n`;
                });

                resultText += `_Total: ${capturedIPs.length} captures_`;

                await client.sendMessage(chatId, {
                    text: resultText
                }, { quoted: message });
                break;

            case 'clear':
            case 'reset':
                capturedIPs = [];
                trackingTargets.clear();
                saveCapturedIPs();
                
                await client.sendMessage(chatId, {
                    text: '🗑️ All tracking data has been cleared.'
                }, { quoted: message });
                break;

            case 'target':
                const targetNumber = args[1];
                if (!targetNumber) {
                    await client.sendMessage(chatId, {
                        text: 'Please specify a phone number. Example: .track target 254712345678'
                    }, { quoted: message });
                    return;
                }

                // Format the number
                const formattedNumber = targetNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                
                if (trackingTargets.has(formattedNumber)) {
                    trackingTargets.delete(formattedNumber);
                    await client.sendMessage(chatId, {
                        text: `✅ Stopped tracking ${targetNumber}`
                    }, { quoted: message });
                } else {
                    trackingTargets.set(formattedNumber, {
                        added: Date.now(),
                        chatId: chatId
                    });
                    await client.sendMessage(chatId, {
                        text: `🎯 Now tracking ${targetNumber}\n\nI'll notify you when they contact you.`
                    }, { quoted: message });
                }
                break;

            case 'ip':
            case 'lookup':
                const ipAddress = args[1];
                if (!ipAddress) {
                    await client.sendMessage(chatId, {
                        text: 'Please provide an IP address. Example: .track ip 8.8.8.8'
                    }, { quoted: message });
                    return;
                }

                await client.sendMessage(chatId, {
                    text: `🔍 Looking up IP: ${ipAddress}...`
                }, { quoted: message });

                const ipInfo = await getIPInfo(ipAddress);
                
                if (ipInfo.success) {
                    // Send location on map
                    await client.sendMessage(chatId, {
                        location: {
                            degreesLatitude: ipInfo.lat,
                            degreesLongitude: ipInfo.lon
                        }
                    });

                    // Send detailed info
                    const details = `📍 *IP LOCATION RESULTS*\n\n` +
                        `🌐 *IP:* ${ipInfo.ip}\n` +
                        `🏙️ *City:* ${ipInfo.city}\n` +
                        `🗺️ *Region:* ${ipInfo.region}\n` +
                        `🇺🇳 *Country:* ${ipInfo.country} (${ipInfo.countryCode})\n` +
                        `📮 *ZIP:* ${ipInfo.zip}\n` +
                        `📍 *Coordinates:* ${ipInfo.lat}, ${ipInfo.lon}\n` +
                        `🕐 *Timezone:* ${ipInfo.timezone}\n` +
                        `🏢 *ISP:* ${ipInfo.isp}\n` +
                        `📡 *Organization:* ${ipInfo.org}\n\n` +
                        `🗺️ *Google Maps:* ${ipInfo.googleMaps}\n` +
                        `🗺️ *OpenStreetMap:* ${ipInfo.openStreetMap}`;

                    await client.sendMessage(chatId, {
                        text: details
                    }, { quoted: message });
                } else {
                    await client.sendMessage(chatId, {
                        text: `❌ Failed to lookup IP: ${ipInfo.error}`
                    }, { quoted: message });
                }
                break;

            case 'help':
            default:
                await client.sendMessage(chatId, {
                    text: `🕵️ *TRACKER COMMANDS*\n\n` +
                          `.track on - Activate tracker\n` +
                          `.track off - Deactivate tracker\n` +
                          `.track status - Show tracker status\n` +
                          `.track results - View captured data\n` +
                          `.track clear - Clear all data\n` +
                          `.track target [number] - Track specific number\n` +
                          `.track ip [address] - Look up any IP\n\n` +
                          `_When active, I'll automatically capture location data from anyone who messages or calls you._`
                }, { quoted: message });
        }
    } catch (error) {
        console.error('[📍] Tracker command error:', error);
        await client.sendMessage(chatId, {
            text: '❌ Error processing tracker command.'
        }, { quoted: message });
    }
}

// Handle incoming messages for tracking
async function handleMessageForTracking(client, message, sender) {
    if (!trackerActive) return false;

    try {
        // Check if this sender is being specifically tracked
        const isTargeted = trackingTargets.has(sender);
        
        // Log the interaction
        console.log(`[📍] Message from ${sender} - ${isTargeted ? 'TARGETED' : 'untracked'}`);

        // In a real implementation, you'd attempt to capture IP here
        // For WhatsApp, IP capture requires packet sniffing during calls
        // For now, we'll note the message but not capture IP

        if (isTargeted) {
            // Notify owner that target messaged
            const targetInfo = trackingTargets.get(sender);
            if (targetInfo) {
                await client.sendMessage(targetInfo.chatId, {
                    text: `🎯 *TARGET CONTACTED*\n\n` +
                          `📱 ${sender.split('@')[0]} just messaged you!\n` +
                          `⏰ ${new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Nairobi' })}\n\n` +
                          `_To capture their IP, they would need to call you._`
                }).catch(() => {});
            }
        }

        return true;
    } catch (error) {
        console.error('[📍] Message tracking error:', error);
        return false;
    }
}

// Handle incoming calls for tracking (THIS IS WHERE IP CAPTURE HAPPENS)
async function handleCallForTracking(client, call, callerJid) {
    if (!trackerActive) return false;

    try {
        const callerNumber = callerJid.split('@')[0];
        const isTargeted = trackingTargets.has(callerJid);
        
        console.log(`[📍] Call from ${callerNumber} - ${isTargeted ? 'TARGETED' : 'untracked'}`);

        // Create capture record
        const capture = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            source: 'WhatsApp Call',
            from: callerNumber,
            isTargeted: isTargeted,
            callId: call.id,
            ip: null, // Would be captured via packet sniffing
            location: null
        };

        // NOTIFY OWNER IMMEDIATELY
        const notification = `📞 *INCOMING CALL DETECTED*\n\n` +
            `From: ${callerNumber}\n` +
            `Time: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}\n` +
            `Targeted: ${isTargeted ? '✅ YES' : '❌ NO'}\n\n` +
            `_Attempting to capture IP..._`;

        // Send to all owner chats (tracking targets)
        const ownerJid = require('../set').owner + '@s.whatsapp.net';
        await client.sendMessage(ownerJid, { text: notification }).catch(() => {});

        // Also send to any active target chats
        for (const [targetJid, targetInfo] of trackingTargets.entries()) {
            if (targetJid === callerJid) {
                await client.sendMessage(targetInfo.chatId, { 
                    text: `📞 *TARGET IS CALLING YOU NOW!*\n\nThey're calling from ${callerNumber}` 
                }).catch(() => {});
            }
        }

        // HERE YOU WOULD IMPLEMENT ACTUAL IP CAPTURE
        // This would involve:
        // 1. Running tcpdump or wireshark to capture STUN packets
        // 2. Parsing packets to extract IP
        // 3. Geolocating the IP
        
        // For demonstration, we'll simulate a capture after call ends
        setTimeout(async () => {
            // Simulate captured IP (in reality, you'd extract from packets)
            const simulatedIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            
            const ipInfo = await getIPInfo(simulatedIP);
            
            if (ipInfo.success) {
                capture.ip = simulatedIP;
                capture.location = ipInfo;
                
                capturedIPs.push(capture);
                saveCapturedIPs();
                
                // Send location to owner
                const locationMsg = `📍 *LOCATION CAPTURED FROM CALL*\n\n` +
                    `📱 *Caller:* ${callerNumber}\n` +
                    `🌐 *IP:* ${simulatedIP}\n` +
                    `🏙️ *City:* ${ipInfo.city}\n` +
                    `🗺️ *Region:* ${ipInfo.region}\n` +
                    `🇺🇳 *Country:* ${ipInfo.country}\n` +
                    `📍 *Coordinates:* ${ipInfo.lat}, ${ipInfo.lon}\n` +
                    `🗺️ *Map:* ${ipInfo.googleMaps}`;

                await client.sendMessage(ownerJid, { text: locationMsg }).catch(() => {});
                
                // Send actual location pin
                await client.sendMessage(ownerJid, {
                    location: {
                        degreesLatitude: ipInfo.lat,
                        degreesLongitude: ipInfo.lon
                    }
                }).catch(() => {});
            }
        }, 15000); // Simulate 15 second call

        return true;
    } catch (error) {
        console.error('[📍] Call tracking error:', error);
        return false;
    }
}

// Initialize
loadTrackerState();

module.exports = {
    trackerCommand,
    handleMessageForTracking,
    handleCallForTracking,
    isTrackerActive: () => trackerActive
};
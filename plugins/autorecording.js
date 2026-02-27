const fs = require('fs');
const path = require('path');

// Main command function
async function autorecordingCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if user is owner using the isOwner parameter
        if (!isOwner) {
            await client.sendMessage(chatId, {
                text: '🚫 owner only!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Path to store autorecording state
        const autorecordingPath = path.join(__dirname, '../data/autorecording.json');
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Initialize file if it doesn't exist
        if (!fs.existsSync(autorecordingPath)) {
            fs.writeFileSync(autorecordingPath, JSON.stringify({ enabled: false }, null, 2));
        }
        
        // Read current state
        let state = { enabled: false };
        try {
            state = JSON.parse(fs.readFileSync(autorecordingPath, 'utf8'));
        } catch (e) {
            state = { enabled: false };
        }
        
        // args is an array from main.js
        const action = args[0]?.toLowerCase();

        if (!action) {
            const status = state.enabled ? '✅ Enabled' : '❌ Disabled';
            await client.sendMessage(chatId, {
                text: `🔊 *AUTO-RECORDING CONTROL*\n\n` +
                      `📊 *Current Status:* ${status}\n\n` +
                      `📝 *Usage:*\n` +
                      `• .autorecording on \n` +
                      `• .autorecording off \n` +
                      `• .autorecording  \n` +
                      `• .autorecording test\n\n` +
                      `⚙️ *Feature:* Shows "recording..." when someone sends a message\n` +
                      `⏱️ *Duration:* 2 seconds\n` +
                      `👑 *Owner Only:* Yes`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }
        
        if (action === 'on' || action === 'enable') {
            state.enabled = true;
            fs.writeFileSync(autorecordingPath, JSON.stringify(state, null, 2));
            
            await client.sendMessage(chatId, {
                text: '✅ *AUTO-RECORDING ENABLED*\n\nBot will show "recording..." when receiving messages.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } 
        else if (action === 'off' || action === 'disable') {
            state.enabled = false;
            fs.writeFileSync(autorecordingPath, JSON.stringify(state, null, 2));
            
            await client.sendMessage(chatId, {
                text: '❌ *AUTO-RECORDING DISABLED*\n\nBot will no longer show recording indicator.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        else if (action === 'status' || action === 'check') {
            const status = state.enabled ? '✅ Enabled' : '❌ Disabled';
            await client.sendMessage(chatId, {
                text: `📊 *AUTO-RECORDING STATUS*\n\n` +
                      `🔊 *Status:* ${status}\n` +
                      `⏱️ *Duration:* 2 seconds\n` +
                      `📱 *Applies to:* All messages\n\n` +
                      `Bot ${state.enabled ? 'will' : 'will NOT'} show recording indicator.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        else if (action === 'test') {
            // Test the recording
            await client.sendMessage(chatId, {
                text: '🔊 *Testing Auto-Recording*\n\nShowing "recording..." for 2 seconds...',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
            await showRecordingIndicator(client, chatId);
            
            setTimeout(async () => {
                await client.sendMessage(chatId, {
                    text: '✅ Test complete! Recording indicator.',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
            }, 2000);
        }
        else {
            await client.sendMessage(chatId, {
                text: '❌ *Invalid Option*\n\n' +
                      'Available options:\n' +
                      '• `on` - Enable auto-recording\n' +
                      '• `off` - Disable auto-recording\n' +
                      '• `status` - Check current status\n' +
                      '• `test` - Test recording indicator',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Auto-recording command error:', error);
        await client.sendMessage(chatId, {
            text: '❌ Failed to update auto-recording settings. Please try again.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Function to check if auto-recording is enabled
function isAutorecordingEnabled() {
    try {
        const autorecordingPath = path.join(__dirname, '../data/autorecording.json');
        if (!fs.existsSync(autorecordingPath)) return false;
        const state = JSON.parse(fs.readFileSync(autorecordingPath, 'utf8'));
        return state.enabled || false;
    } catch {
        return false;
    }
}

// Function to show recording indicator
async function showRecordingIndicator(client, chatId) {
    try {
        await client.sendPresenceUpdate('recording', chatId);
        setTimeout(async () => {
            try {
                await client.sendPresenceUpdate('paused', chatId);
            } catch (error) {}
        }, 5000);
    } catch (error) {
        console.error('Recording indicator error:', error);
    }
}

module.exports = {
    autorecordingCommand,
    isAutorecordingEnabled,
    showRecordingIndicator
};
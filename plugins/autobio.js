const Config = require('../set');
const fs = require('fs');
const path = require('path');

// File to store auto bio settings
const autobioFile = path.join(__dirname, '..', 'data', 'autobio.json');

// Default settings
const defaultSettings = {
    status: 'off',
    message: 'MAD-MAX Always active!',
    interval: 60, // minutes
    lastUpdate: null
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Read settings from file
function readAutoBioSettings() {
    try {
        if (!fs.existsSync(autobioFile)) {
            // Create default settings file
            fs.writeFileSync(autobioFile, JSON.stringify(defaultSettings, null, 2));
            return defaultSettings;
        }
        const data = fs.readFileSync(autobioFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading auto bio settings:', error);
        return defaultSettings;
    }
}

// Write settings to file
function writeAutoBioSettings(settings) {
    try {
        fs.writeFileSync(autobioFile, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing auto bio settings:', error);
        return false;
    }
}

// Update bot's bio/about
async function updateBotBio(client, newMessage) {
    try {
        // Check if client has updateProfileStatus method
        if (client.updateProfileStatus) {
            await client.updateProfileStatus(newMessage);
            console.log(`✅ Bot bio updated to: ${newMessage}`);
            return true;
        } 
        // Alternative method for some WhatsApp libraries
        else if (client.sendMessage) {
            // For Baileys - update profile status
            await client.sendMessage('status@broadcast', {
                text: newMessage
            });
            console.log(`✅ Bot bio updated via status: ${newMessage}`);
            return true;
        }
        else {
            console.log('⚠️ Cannot update bio: Method not available');
            return false;
        }
    } catch (error) {
        console.error('Error updating bot bio:', error);
        return false;
    }
}

// Main auto bio command
async function autobioCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const settings = readAutoBioSettings();
        
        // If no arguments, show current settings
        if (!args || args.length === 0) {
            const statusEmoji = settings.status === 'on' ? '✅' : '❌';
            const statusText = settings.status === 'on' ? 'Enabled' : 'Disabled';
            
            await client.sendMessage(chatId, {
                text: `🔄 *AUTO BIO SETTINGS*\n\n` +
                      `📊 *Status:* ${statusEmoji} ${statusText}\n` +
                      `📝 *Message:* ${settings.message}\n` +
                      `⏱️ *Interval:* ${settings.interval} minutes\n\n` +
                      `*Commands:*\n` +
                      `▸ .autobio on - Enable auto bio\n` +
                      `▸ .autobio off - Disable auto bio\n` +
                      `▸ .autobio msg [text] - Set bio message\n` +
                      `▸ .autobio interval [minutes] - Set update interval\n` +
                      `▸ .autobio now - Update bio now\n\n` +
                      `> ${Config.caption || 'MAD-MAX BOT'}`,
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

        const subCommand = args[0].toLowerCase();

        // Handle: .autobio on
        if (subCommand === 'on') {
            settings.status = 'on';
            settings.lastUpdate = new Date().toISOString();
            
            if (writeAutoBioSettings(settings)) {
                // Update bio immediately when turning on
                await updateBotBio(client, settings.message);
                
                await client.sendMessage(chatId, {
                    text: `✅ *Auto Bio Enabled*\n\nBio will update every ${settings.interval} minutes with message:\n"${settings.message}"`,
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
        
        // Handle: .autobio off
        else if (subCommand === 'off') {
            settings.status = 'off';
            
            if (writeAutoBioSettings(settings)) {
                await client.sendMessage(chatId, {
                    text: `❌ *Auto Bio Disabled*`,
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
        
        // Handle: .autobio msg [text]
        else if (subCommand === 'msg' || subCommand === 'message') {
            const newMessage = args.slice(1).join(' ');
            
            if (!newMessage) {
                await client.sendMessage(chatId, {
                    text: `❌ Please provide a message!\n\nExample: .autobio msg I am online now!`,
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

            settings.message = newMessage;
            
            if (writeAutoBioSettings(settings)) {
                // Update bio immediately if auto bio is on
                if (settings.status === 'on') {
                    await updateBotBio(client, newMessage);
                }
                
                await client.sendMessage(chatId, {
                    text: `✅ *Bio Message Updated*\n\nNew message: "${newMessage}"`,
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
        
        // Handle: .autobio interval [minutes]
        else if (subCommand === 'interval') {
            const minutes = parseInt(args[1]);
            
            if (isNaN(minutes) || minutes < 5 || minutes > 1440) {
                await client.sendMessage(chatId, {
                    text: `❌ Please provide a valid interval (5-1440 minutes).\n\nExample: .autobio interval 60`,
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

            settings.interval = minutes;
            
            if (writeAutoBioSettings(settings)) {
                await client.sendMessage(chatId, {
                    text: `✅ *Update Interval Set*\n\nBio will update every ${minutes} minutes.`,
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
        
        // Handle: .autobio now
        else if (subCommand === 'now') {
            const updated = await updateBotBio(client, settings.message);
            
            if (updated) {
                settings.lastUpdate = new Date().toISOString();
                writeAutoBioSettings(settings);
                
                await client.sendMessage(chatId, {
                    text: `✅ *Bio Updated Now*\n\nMessage: "${settings.message}"`,
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
            } else {
                await client.sendMessage(chatId, {
                    text: `❌ Failed to update bio. Check if bot has permission.`,
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
        
        else {
            await client.sendMessage(chatId, {
                text: `❌ Unknown command. Use .autobio for help.`,
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
        console.error('Auto bio error:', error);
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`,
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

// Auto bio interval checker - call this function when bot starts
function startAutoBioInterval(client) {
    // Check every minute
    setInterval(async () => {
        try {
            const settings = readAutoBioSettings();
            
            // If auto bio is off, do nothing
            if (settings.status !== 'on') return;
            
            // Check if it's time to update
            if (settings.lastUpdate) {
                const lastUpdate = new Date(settings.lastUpdate);
                const now = new Date();
                const minutesSinceUpdate = (now - lastUpdate) / (1000 * 60);
                
                if (minutesSinceUpdate >= settings.interval) {
                    console.log('⏰ Auto bio: Time to update!');
                    const updated = await updateBotBio(client, settings.message);
                    
                    if (updated) {
                        settings.lastUpdate = now.toISOString();
                        writeAutoBioSettings(settings);
                        console.log(`✅ Auto bio updated to: ${settings.message}`);
                    }
                }
            } else {
                // First time - update now
                const updated = await updateBotBio(client, settings.message);
                if (updated) {
                    settings.lastUpdate = new Date().toISOString();
                    writeAutoBioSettings(settings);
                }
            }
        } catch (error) {
            console.error('Auto bio interval error:', error);
        }
    }, 60000); // Check every minute
    
    console.log('🔄 Auto bio interval checker started');
}

module.exports = {
    autobioCommand,
    startAutoBioInterval
};
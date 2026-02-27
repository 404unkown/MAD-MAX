/**
 * MAD-MAX - A WhatsApp Bot
 * Autotyping Command - Shows fake typing status
 */

const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        return { enabled: false };
    }
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return { enabled: false };
    }
}

// Save configuration
function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Toggle autotyping feature
async function autotypingCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if user is owner
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

        // Initialize or read config
        const config = initConfig();
        
        // args is an array from main.js
        const action = args[0]?.toLowerCase() || '';
        
        // Show status if no arguments
        if (!action) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            await client.sendMessage(chatId, {
                text: `⌨️ *AUTO-TYPING*\n\n` +
                      `Status: ${status}\n\n` +
                      `*Commands:*\n` +
                      `• .autotyping on - Enable auto-typing\n` +
                      `• .autotyping off - Disable auto-typing\n` +
                      `• .autotyping status - Check status`,
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
        
        if (action === 'status') {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            await client.sendMessage(chatId, {
                text: `📊 *AUTO-TYPING STATUS*\n\nAuto-typing is ${status}`,
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
            config.enabled = true;
            saveConfig(config);
            await client.sendMessage(chatId, {
                text: '✅ *AUTO-TYPING ENABLED*\n\nBot will now show typing indicators when processing messages.',
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
            config.enabled = false;
            saveConfig(config);
            await client.sendMessage(chatId, {
                text: '❌ *AUTO-TYPING DISABLED*\n\nBot will no longer show typing indicators.',
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
        else {
            await client.sendMessage(chatId, {
                text: '❌ *Invalid option!*\n\nUse: .autotyping on/off/status',
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
        console.error('Error in autotyping command:', error);
        await client.sendMessage(chatId, {
            text: '❌ Error processing command!',
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

// Function to check if autotyping is enabled
function isAutotypingEnabled() {
    try {
        const config = initConfig();
        return config.enabled || false;
    } catch (error) {
        console.error('Error checking autotyping status:', error);
        return false;
    }
}

// Function to handle autotyping for regular messages
async function handleAutotypingForMessage(client, chatId, userMessage) {
    if (isAutotypingEnabled()) {
        try {
            // First subscribe to presence updates for this chat
            await client.presenceSubscribe(chatId);
            
            // Send available status first
            await client.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the composing status
            await client.sendPresenceUpdate('composing', chatId);
            
            // Simulate typing time based on message length
            const typingDelay = Math.max(2000, Math.min(5000, userMessage.length * 100));
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            
            // Finally send paused status
            await client.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('❌ Error sending typing indicator:', error);
            return false;
        }
    }
    return false;
}

// Function to handle autotyping for commands
async function handleAutotypingForCommand(client, chatId, command) {
    if (isAutotypingEnabled()) {
        try {
            await client.presenceSubscribe(chatId);
            await client.sendPresenceUpdate('composing', chatId);
            return true;
        } catch (error) {
            console.error('❌ Error sending command typing indicator:', error);
            return false;
        }
    }
    return false;
}

// Function to show typing status AFTER command execution
async function showTypingAfterCommand(client, chatId) {
    if (isAutotypingEnabled()) {
        try {
            // Show typing status briefly after command
            await client.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 5000));
            await client.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (error) {
            console.error('❌ Error sending post-command typing indicator:', error);
            return false;
        }
    }
    return false;
}

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};
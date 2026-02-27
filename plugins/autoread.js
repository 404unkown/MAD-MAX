/**
 * MAD-MAX - A WhatsApp Bot
 * Autoread Command - Automatically read all messages
 */

const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

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
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Toggle autoread feature
async function autoreadCommand(client, chatId, message, args, sender, pushName, isOwner) {
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

        // Read config
        const config = initConfig();
        
        // Get action from args (args is an array from main.js)
        const action = args[0]?.toLowerCase();
        
        // Show status if no arguments
        if (!action) {
            await client.sendMessage(chatId, {
                text: `🔍 *AUTO-READ STATUS*\n\n` +
                      `Current Status: ${config.enabled ? '✅ ON' : '❌ OFF'}\n\n` +
                      `*Commands:*\n` +
                      `• .autoread on \n` +
                      `• .autoread off \n` +
                      `• .autoread status `,
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
            await client.sendMessage(chatId, {
                text: `📊 *AUTO-READ STATUS*\n\n` +
                      `Auto-read is currently *${config.enabled ? '✅ ENABLED' : '❌ DISABLED'}*.`,
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
                text: '✅ *AUTO-READ ENABLED*\n\nBot will now automatically read all messages.',
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
                text: '❌ *AUTO-READ DISABLED*\n\nBot will no longer automatically read messages.',
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
                text: '❌ *Invalid Option*\n\n' +
                      'Available options:\n' +
                      '• `on` - Enable auto-read\n' +
                      '• `off` - Disable auto-read\n' +
                      '• `status` - Check current status',
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
        console.error('Error in autoread command:', error);
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

// Function to check if autoread is enabled
function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

// Function to check if bot is mentioned in a message
function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    // Check for mentions in contextInfo
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    // Check for explicit mentions in mentionedJid array
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                return true;
            }
        }
    }
    
    // Check for text mentions
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        // Check for @mention format
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        // Check for bot name mentions
        const botNames = ['mad-max', 'bot', 'max', 'MAD-MAX'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    
    return false;
}

// Function to handle autoread functionality
async function handleAutoread(client, message) {
    if (isAutoreadEnabled()) {
        // Get bot's ID
        const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if bot is mentioned
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        if (isBotMentioned) {
            // Don't mark as read when mentioned
            return false;
        } else {
            // For regular messages, mark as read
            try {
                const key = { 
                    remoteJid: message.key.remoteJid, 
                    id: message.key.id, 
                    participant: message.key.participant 
                };
                await client.readMessages([key]);
                return true;
            } catch (error) {
                console.error('Error marking message as read:', error);
                return false;
            }
        }
    }
    return false;
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};
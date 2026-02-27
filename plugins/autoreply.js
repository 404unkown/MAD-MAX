/**
 * MAD-MAX - Text Auto Reply Command
 * Separate from voice auto-replies
 */

const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoreply.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Default autoreply message
const DEFAULT_MESSAGE = "Hello! I'm currently busy. I'll get back to you soon.";

// Initialize configuration file
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            enabled: false,
            message: DEFAULT_MESSAGE,
            lastUpdated: Date.now()
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return {
            enabled: false,
            message: DEFAULT_MESSAGE,
            lastUpdated: Date.now()
        };
    }
}

// Save configuration
function saveConfig(config) {
    config.lastUpdated = Date.now();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Show typing indicator
async function showTypingIndicator(client, chatId) {
    try {
        await client.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

// Autoreply command handler (TEXT ONLY)
async function autoreplyCommand(client, chatId, message, args, sender, pushName, isOwner) {
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

        // Initialize config
        const config = initConfig();
        
        // args is an array from main.js
        const action = args[0]?.toLowerCase() || '';
        
        // Show status if no arguments
        if (!action) {
            const status = config.enabled ? '✅ ON' : '❌ OFF';
            
            await client.sendMessage(chatId, {
                text: `📝 *TEXT AUTO REPLY*\n\n` +
                      `Status: ${status}\n` +
                      `Message: ${config.message}\n\n` +
                      `*Commands:*\n` +
                      `• .autoreply on [message] - Enable with custom message\n` +
                      `• .autoreply off - Disable\n` +
                      `• .autoreply set [message] - Set new message\n` +
                      `• .autoreply status - Check status`,
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
                text: `📊 *AUTO REPLY STATUS*\n\n` +
                      `Enabled: ${status}\n` +
                      `Message: ${config.message}`,
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
        
        if (action === 'on') {
            // Enable autoreply
            config.enabled = true;
            
            // Check if there's a custom message
            const customMessage = args.slice(1).join(' ');
            if (customMessage.trim()) {
                config.message = customMessage;
            }
            
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: `✅ *TEXT AUTO REPLY ENABLED*\n\nMessage: ${config.message}\n\nI will now auto-reply to private messages.`,
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
            
        } else if (action === 'off') {
            // Disable autoreply
            config.enabled = false;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: '❌ *TEXT AUTO REPLY DISABLED*\n\nI will no longer auto-reply to private messages.',
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
            
        } else if (action === 'set') {
            // Set new message
            const customMessage = args.slice(1).join(' ');
            if (!customMessage.trim()) {
                await client.sendMessage(chatId, {
                    text: '❌ Please provide a message!\nExample: `.autoreply set I am busy now`',
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
            
            config.message = customMessage;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: `✅ *AUTO REPLY MESSAGE UPDATED*\n\nNew message: ${config.message}`,
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
                text: '❌ *Invalid Command*\n\n' +
                      'Available options:\n' +
                      '• `on [message]` - Enable with custom message\n' +
                      '• `off` - Disable\n' +
                      '• `set [message]` - Set new message\n' +
                      '• `status` - Check status',
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
        console.error('❌ Error in autoreply command:', error);
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

// Check if autoreply is enabled
function isAutoreplyEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autoreply status:', error);
        return false;
    }
}

// Get autoreply message
function getAutoreplyMessage() {
    try {
        const config = initConfig();
        return config.message;
    } catch (error) {
        console.error('Error getting autoreply message:', error);
        return DEFAULT_MESSAGE;
    }
}

// Handle autoreply for private messages (TEXT ONLY)
async function handleAutoreply(client, chatId, senderId, userMessage, message) {
    try {
        // Only respond in private chats
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't respond to bot's own messages
        if (message.key.fromMe) return false;
        
        // Don't respond to commands
        if (userMessage.startsWith('.')) return false;
        
        // Check if autoreply is enabled
        if (!isAutoreplyEnabled()) return false;
        
        // Skip if message is too short
        if (!userMessage.trim() || userMessage.trim().length < 1) return false;
        
        // Show typing indicator before sending reply
        await showTypingIndicator(client, chatId);
        
        // Add a small delay to make it seem more natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the autoreply message
        const replyMessage = getAutoreplyMessage();
        
        // Send autoreply message
        await client.sendMessage(chatId, {
            text: replyMessage
        });
        
        console.log(`📩 Text autoreply sent to ${senderId.split('@')[0]}`);
        return true;
        
    } catch (error) {
        console.error('Error in handleAutoreply:', error);
        return false;
    }
}

module.exports = {
    autoreplyCommand,
    isAutoreplyEnabled,
    getAutoreplyMessage,
    handleAutoreply
};
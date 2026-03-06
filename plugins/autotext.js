/**
 * MAD-MAX - Advanced AutoText Command
 * Works like autoreply but with text matching in all chats
 */

const fs = require('fs');
const path = require('path');

const autotextPath = path.join(__dirname, '../data/autotext.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Show typing indicator
async function showTypingIndicator(client, chatId) {
    try {
        await client.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

// Initialize/load configuration
function initConfig() {
    if (!fs.existsSync(autotextPath)) {
        const defaultConfig = {
            enabled: false,
            responses: {
                "hi": "Hello! I'm MAD-MAX Bot",
                "hello": "Hi there!",
                "help": "Type .help for commands"
            },
            lastUpdated: Date.now()
        };
        fs.writeFileSync(autotextPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
    
    try {
        const fileContent = fs.readFileSync(autotextPath, 'utf8').trim();
        
        if (!fileContent) {
            const defaultConfig = {
                enabled: false,
                responses: {},
                lastUpdated: Date.now()
            };
            fs.writeFileSync(autotextPath, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
        
        const config = JSON.parse(fileContent);
        
        // Handle old format (just responses object)
        if (config.enabled === undefined) {
            const newConfig = {
                enabled: false,
                responses: config,
                lastUpdated: Date.now()
            };
            fs.writeFileSync(autotextPath, JSON.stringify(newConfig, null, 2));
            return newConfig;
        }
        
        return config;
    } catch (error) {
        console.error('Error parsing autotext.json:', error);
        const defaultConfig = {
            enabled: false,
            responses: {},
            lastUpdated: Date.now()
        };
        fs.writeFileSync(autotextPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
}

// Save configuration
function saveConfig(config) {
    config.lastUpdated = Date.now();
    fs.writeFileSync(autotextPath, JSON.stringify(config, null, 2));
}

// Handle autotext for messages
async function handleAutotext(client, chatId, senderId, userMessage, message) {
    try {
        const config = initConfig();
        
        // Check if autotext is enabled
        if (!config.enabled) {
            return false;
        }
        
        // Don't auto-reply to bot's own messages
        if (message.key.fromMe) {
            return false;
        }

        // Clean the message for better matching
        const cleanMessage = userMessage.toLowerCase().trim();
        
        // Check for matches with improved pattern matching
        for (const text in config.responses) {
            const trigger = text.toLowerCase();
            
            // Check multiple matching conditions (in order of priority)
            let matched = false;
            
            // 1. Exact match (highest priority)
            if (cleanMessage === trigger) {
                matched = true;
            }
            // 2. Message starts with trigger followed by space or punctuation
            else if (cleanMessage.startsWith(trigger + ' ') ||
                     cleanMessage.startsWith(trigger + ',') ||
                     cleanMessage.startsWith(trigger + '.') ||
                     cleanMessage.startsWith(trigger + '!') ||
                     cleanMessage.startsWith(trigger + '?')) {
                matched = true;
            }
            // 3. Message contains trigger as a standalone word
            else if (cleanMessage.includes(' ' + trigger + ' ') ||
                     cleanMessage.includes(' ' + trigger + ',') ||
                     cleanMessage.includes(' ' + trigger + '.') ||
                     cleanMessage.includes(' ' + trigger + '!') ||
                     cleanMessage.includes(' ' + trigger + '?')) {
                matched = true;
            }
            // 4. For short triggers (1-5 chars), check if they're the first word
            else if (trigger.length <= 5) {
                const firstWord = cleanMessage.split(' ')[0];
                if (firstWord === trigger) {
                    matched = true;
                }
            }
            
            if (matched) {
                // Show typing indicator before sending reply
                await showTypingIndicator(client, chatId);
                
                // Add a small delay to make it seem more natural
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Send reply
                await client.sendMessage(chatId, {
                    text: config.responses[text]
                }, { quoted: message });
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Autotext error:', error);
        return false;
    }
}

// Command to manage autotext
async function autotextCommand(client, chatId, message, args, sender, pushName, isOwner) {
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
            const responseCount = Object.keys(config.responses || {}).length;
            
            const statusMessage = `📝 *AUTOTEXT MANAGER*\n\n` +
                                `Status: ${status}\n` +
                                `Responses: ${responseCount} entries\n\n` +
                                `*Commands:*\n` +
                                `• .autotext on - Enable AutoText\n` +
                                `• .autotext off - Disable AutoText\n` +
                                `• .autotext add [trigger] [response] - Add new response\n` +
                                `• .autotext del [trigger] - Remove response\n` +
                                `• .autotext list - List all responses\n` +
                                `• .autotext status - Show current status\n` +
                                `• .autotext clear - Reset to defaults`;
            
            await client.sendMessage(chatId, {
                text: statusMessage,
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
            const responseCount = Object.keys(config.responses || {}).length;
            
            await client.sendMessage(chatId, {
                text: `📊 *AUTOTEXT STATUS*\n\n` +
                      `Enabled: ${status}\n` +
                      `Total Responses: ${responseCount}`,
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
            // Enable autotext
            config.enabled = true;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: '✅ *AUTOTEXT ENABLED*\n\nI will now auto-respond to matching text in all chats.',
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
            // Disable autotext
            config.enabled = false;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: '❌ *AUTOTEXT DISABLED*\n\nAuto responses have been turned off.',
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
            
        } else if (action === 'add') {
            // Add new response
            if (args.length < 3) {
                await client.sendMessage(chatId, {
                    text: '❌ *Invalid usage!*\n\nExample: `.autotext add hi Hello there!`\nMake sure trigger and response are separated by space.',
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
            
            const trigger = args[1].toLowerCase();
            const response = args.slice(2).join(' ');
            
            if (!config.responses) config.responses = {};
            config.responses[trigger] = response;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: `✅ *RESPONSE ADDED*\n\nTrigger: "${trigger}"\nResponse: ${response}`,
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
            
        } else if (action === 'del' || action === 'remove' || action === 'delete') {
            // Remove response
            if (args.length < 2) {
                await client.sendMessage(chatId, {
                    text: '❌ *Please specify trigger to remove!*\n\nExample: `.autotext del hi`',
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
            
            const trigger = args[1].toLowerCase();
            
            if (!config.responses || !config.responses[trigger]) {
                await client.sendMessage(chatId, {
                    text: `❌ No response found for trigger: "${trigger}"`,
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
            
            delete config.responses[trigger];
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: `✅ *RESPONSE REMOVED*\n\nTrigger: "${trigger}" has been deleted.`,
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
            
        } else if (action === 'list') {
            // List all responses
            if (!config.responses || Object.keys(config.responses).length === 0) {
                await client.sendMessage(chatId, {
                    text: '📝 *No AutoText responses found.*\n\nUse `.autotext add` to create new ones.',
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
            
            let list = '📝 *AUTOTEXT RESPONSES:*\n\n';
            Object.entries(config.responses).forEach(([trigger, response], index) => {
                list += `${index + 1}. *"${trigger}"* → ${response}\n`;
            });
            
            await client.sendMessage(chatId, {
                text: list,
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
            
        } else if (action === 'clear') {
            // Clear all responses (reset to default)
            config.responses = {
                "hi": "Hello! I'm MAD-MAX Bot",
                "hello": "Hi there!",
                "help": "Type .help for commands"
            };
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: '🗑️ *All responses cleared!*\n\nReset to default responses.',
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
            // Invalid action
            await client.sendMessage(chatId, {
                text: '❌ *Invalid command!*\n\n' +
                      'Available options:\n' +
                      '• `on` - Enable\n' +
                      '• `off` - Disable\n' +
                      '• `add [trigger] [response]` - Add response\n' +
                      '• `del [trigger]` - Remove response\n' +
                      '• `list` - List all\n' +
                      '• `status` - Show status\n' +
                      '• `clear` - Reset to defaults',
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
        console.error('Error in autotext command:', error);
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

// Check if autotext is enabled
function isAutotextEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autotext status:', error);
        return false;
    }
}

module.exports = {
    handleAutotext,
    autotextCommand,
    isAutotextEnabled
};
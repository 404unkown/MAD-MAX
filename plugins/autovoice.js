/**
 * MAD-MAX - Auto Voice Reply Command
 * Separate command for voice note auto-replies
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autovoice.json');
const voiceNotesDir = path.join(__dirname, '..', 'data', 'autovoice_voices');

// Ensure directories exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Create voice notes directory if it doesn't exist
if (!fs.existsSync(voiceNotesDir)) {
    fs.mkdirSync(voiceNotesDir, { recursive: true });
}

// Initialize configuration
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            enabled: false,
            voiceNotePath: null,
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
            voiceNotePath: null,
            lastUpdated: Date.now()
        };
    }
}

// Save configuration
function saveConfig(config) {
    config.lastUpdated = Date.now();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Save voice note
async function saveVoiceNote(client, message, userId) {
    try {
        console.log('🎤 Saving voice note for autovoice...');
        
        if (!message.message?.audioMessage) {
            throw new Error('No audio message found');
        }
        
        const buffer = await downloadMediaMessage(
            message,
            'buffer',
            {},
            { 
                logger: console,
                reuploadRequest: client.updateMediaMessage 
            }
        );
        
        if (!buffer || buffer.length === 0) {
            throw new Error('Downloaded buffer is empty');
        }
        
        console.log(`🎤 Downloaded ${buffer.length} bytes`);
        
        const filename = `autovoice_${userId}_${Date.now()}.opus`;
        const filepath = path.join(voiceNotesDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`🎤 Saved to: ${filepath}`);
        
        // Delete old voice note
        const config = initConfig();
        if (config.voiceNotePath && fs.existsSync(config.voiceNotePath)) {
            try {
                fs.unlinkSync(config.voiceNotePath);
                console.log('🗑️ Deleted old voice note');
            } catch (e) {}
        }
        
        return filepath;
    } catch (error) {
        console.error('❌ Error saving voice note:', error);
        throw error;
    }
}

// Get voice note buffer
function getVoiceNoteBuffer() {
    try {
        const config = initConfig();
        if (!config.voiceNotePath || !fs.existsSync(config.voiceNotePath)) {
            return null;
        }
        return fs.readFileSync(config.voiceNotePath);
    } catch (error) {
        console.error('Error getting voice note:', error);
        return null;
    }
}

// Show recording indicator
async function showRecordingIndicator(client, chatId) {
    try {
        await client.sendPresenceUpdate('recording', chatId);
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error('Recording indicator error:', error);
    }
}

// Auto voice command handler
async function autovoiceCommand(client, chatId, message, args, sender, pushName, isOwner) {
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
        
        // Check if we're saving a voice note (if message has audio)
        const isAudioMessage = message.message?.audioMessage;
        const isQuotedAudio = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage;
        
        if (isAudioMessage || isQuotedAudio) {
            try {
                console.log('💾 Saving voice note for autovoice...');
                let messageToSave = message;
                
                if (isQuotedAudio) {
                    messageToSave = {
                        ...message,
                        message: {
                            audioMessage: message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage
                        }
                    };
                }
                
                const voicePath = await saveVoiceNote(client, messageToSave, sender.split('@')[0]);
                config.voiceNotePath = voicePath;
                config.enabled = true;
                saveConfig(config);
                
                await client.sendMessage(chatId, {
                    text: '✅ *AUTO VOICE ENABLED*\n\nYour voice note has been saved. I will now auto-reply with this voice note to private messages.',
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
            } catch (error) {
                console.error('❌ Error saving voice note:', error);
                await client.sendMessage(chatId, {
                    text: '❌ Failed to save voice note!\n\nPlease try again.',
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
        }
        
        // args is an array from main.js
        const action = args[0]?.toLowerCase() || '';
        
        // Show status if no arguments
        if (!action) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const voiceNoteStatus = config.voiceNotePath && fs.existsSync(config.voiceNotePath) ? '✅ Set' : '❌ Not Set';
            
            await client.sendMessage(chatId, {
                text: `🎤 *AUTO VOICE REPLY*\n\n` +
                      `Status: ${status}\n` +
                      `Voice Note: ${voiceNoteStatus}\n\n` +
                      `*Commands:*\n` +
                      `• .autovoice on - Enable\n` +
                      `• .autovoice off - Disable\n` +
                      `• .autovoice status - Check status\n` +
                      `• Send a voice note with caption .autovoice to set`,
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
            const voiceNoteStatus = config.voiceNotePath && fs.existsSync(config.voiceNotePath) ? '✅ Set' : '❌ Not Set';
            
            await client.sendMessage(chatId, {
                text: `📊 *AUTO VOICE STATUS*\n\n` +
                      `Enabled: ${status}\n` +
                      `Voice Note: ${voiceNoteStatus}`,
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
            if (!config.voiceNotePath || !fs.existsSync(config.voiceNotePath)) {
                await client.sendMessage(chatId, {
                    text: '❌ No voice note set! Send a voice note with caption `.autovoice` first.',
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
            
            config.enabled = true;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: '✅ *AUTO VOICE ENABLED*\n\nI will now auto-reply with voice notes to private messages.',
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
            config.enabled = false;
            saveConfig(config);
            
            await client.sendMessage(chatId, {
                text: '❌ *AUTO VOICE DISABLED*\n\nI will no longer auto-reply with voice notes.',
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
                text: '❌ *Invalid command!*\n\nAvailable options:\n• `on`\n• `off`\n• `status`',
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
        console.error('❌ Error in autovoice command:', error);
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

// Check if autovoice is enabled
function isAutovoiceEnabled() {
    try {
        const config = initConfig();
        return config.enabled && config.voiceNotePath && fs.existsSync(config.voiceNotePath);
    } catch (error) {
        console.error('Error checking autovoice status:', error);
        return false;
    }
}

// Handle autovoice replies
async function handleAutovoice(client, chatId, senderId, userMessage, message) {
    try {
        // Only respond in private chats
        if (chatId.endsWith('@g.us')) return false;
        
        // Don't respond to bot's own messages
        if (message.key.fromMe) return false;
        
        // Don't respond to commands
        if (userMessage.startsWith('.')) return false;
        
        // Check if autovoice is enabled
        if (!isAutovoiceEnabled()) return false;
        
        // Skip if message is too short
        if (!userMessage.trim() || userMessage.trim().length < 1) return false;
        
        // Show recording indicator before sending voice note
        await showRecordingIndicator(client, chatId);
        
        // Small delay to make it natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Send voice note
        const voiceBuffer = getVoiceNoteBuffer();
        if (voiceBuffer) {
            await client.sendMessage(chatId, {
                audio: voiceBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });
            
            console.log(`🎤 Autovoice sent to ${senderId.split('@')[0]}`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error in handleAutovoice:', error);
        return false;
    }
}

module.exports = {
    autovoiceCommand,
    isAutovoiceEnabled,
    handleAutovoice
};
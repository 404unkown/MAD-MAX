const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Paths
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'autosticker.json');
const STICKER_DIR = path.join(__dirname, '..', 'autos', 'autosticker');

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
        await fs.mkdir(STICKER_DIR, { recursive: true });
        
        // Create default config if doesn't exist
        if (!fsSync.existsSync(CONFIG_PATH)) {
            await fs.writeFile(CONFIG_PATH, JSON.stringify({
                "hi": "hi.webp",
                "hello": "hello.webp",
                "good morning": "morning.webp",
                "good night": "night.webp"
            }, null, 2));
        }
    } catch (error) {
        console.error('Error ensuring directories:', error);
    }
}

// Read config
async function readConfig() {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        await ensureDirectories();
        return {};
    }
}

// Write config
async function writeConfig(config) {
    try {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing config:', error);
        return false;
    }
}

// List all stickers
async function listStickers() {
    try {
        const files = await fs.readdir(STICKER_DIR);
        return files.filter(file => 
            file.endsWith('.webp') || 
            file.endsWith('.png') || 
            file.endsWith('.jpg') ||
            file.endsWith('.jpeg')
        );
    } catch (error) {
        return [];
    }
}

// Auto-sticker command handler
async function autostickerCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        await ensureDirectories();
        
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
        
        const subcommand = args[0]?.toLowerCase();
        
        if (!subcommand) {
            // Show help
            const helpText = `╭─❖ *🎭 AUTO-STICKER MANAGER* ❖─
│
├─ *Usage:* .autosticker <command>
│
├─ *Commands:*
│  ├─ .autosticker on - Enable auto-sticker
│  ├─ .autosticker off - Disable auto-sticker
│  ├─ .autosticker list - List all triggers
│  ├─ .autosticker add <text> <sticker> - Add trigger
│  ├─ .autosticker remove <text> - Remove trigger
│  ├─ .autosticker upload - Upload sticker (reply to sticker)
│  └─ .autosticker status - Show status
│
├─ *Examples:*
│  ├─ .autosticker on
│  ├─ .autosticker list
│  ├─ .autosticker add hi hi.webp
│  └─ .autosticker upload (reply to sticker)
│
╰─➤ _Automatically send stickers for keywords_`;
            
            await client.sendMessage(chatId, {
                text: helpText,
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
        
        switch (subcommand) {
            case 'on':
            case 'enable':
                // Save auto-sticker state to a config file
                const statePath = path.join(__dirname, '..', 'data', 'autosticker_state.json');
                await fs.writeFile(statePath, JSON.stringify({ enabled: true }, null, 2));
                
                await client.sendMessage(chatId, {
                    text: '✅ *AUTO-STICKER ENABLED*\n\nBot will now automatically send stickers for configured keywords.',
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
                break;
                
            case 'off':
            case 'disable':
                // Disable auto-sticker
                const statePathOff = path.join(__dirname, '..', 'data', 'autosticker_state.json');
                await fs.writeFile(statePathOff, JSON.stringify({ enabled: false }, null, 2));
                
                await client.sendMessage(chatId, {
                    text: '❌ *AUTO-STICKER DISABLED*\n\nBot will no longer send automatic stickers.',
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
                break;
                
            case 'list':
                // List all configured triggers
                const config = await readConfig();
                const stickers = await listStickers();
                
                if (Object.keys(config).length === 0) {
                    await client.sendMessage(chatId, {
                        text: '📝 *No auto-stickers configured*\nUse `.autosticker add` to add triggers.',
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
                
                let listText = '╭─❖ *🎭 AUTO-STICKER LIST* ❖─\n│\n';
                
                Object.entries(config).forEach(([trigger, stickerFile], index) => {
                    const exists = fsSync.existsSync(path.join(STICKER_DIR, stickerFile));
                    const status = exists ? '✅' : '❌';
                    listText += `├─ ${status} *"${trigger}"* → ${stickerFile}\n`;
                });
                
                listText += `│\n├─ *Total triggers:* ${Object.keys(config).length}\n`;
                listText += `├─ *Available stickers:* ${stickers.length}\n`;
                listText += `╰─➤ _Use .autosticker add to add more_`;
                
                await client.sendMessage(chatId, {
                    text: listText,
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
                break;
                
            case 'add':
                // Add new trigger
                if (args.length < 3) {
                    await client.sendMessage(chatId, {
                        text: '❌ *Usage:* .autosticker add <text> <sticker-file>\n\n*Example:* .autosticker add hello hello.webp',
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
                const stickerFile = args[2];
                
                // Check if sticker file exists
                const stickerPath = path.join(STICKER_DIR, stickerFile);
                if (!fsSync.existsSync(stickerPath)) {
                    // List available stickers
                    const availableStickers = await listStickers();
                    
                    let errorText = `❌ *Sticker not found*\nFile "${stickerFile}" not found in sticker directory.\n\n*Available stickers:*\n`;
                    availableStickers.forEach(file => {
                        errorText += `├─ ${file}\n`;
                    });
                    errorText += `╰─➤ _Use .autosticker upload to add stickers_`;
                    
                    await client.sendMessage(chatId, {
                        text: errorText,
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
                
                // Add to config
                const currentConfig = await readConfig();
                currentConfig[trigger] = stickerFile;
                await writeConfig(currentConfig);
                
                await client.sendMessage(chatId, {
                    text: `✅ *Trigger added*\n\n*Trigger:* "${trigger}"\n*Sticker:* ${stickerFile}\n\nNow when someone says "${trigger}", the bot will automatically send ${stickerFile}`,
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
                break;
                
            case 'remove':
            case 'delete':
                // Remove trigger
                if (args.length < 2) {
                    await client.sendMessage(chatId, {
                        text: '❌ *Usage:* .autosticker remove <text>\n\n*Example:* .autosticker remove hello',
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
                
                const triggerToRemove = args[1].toLowerCase();
                const configToUpdate = await readConfig();
                
                if (!configToUpdate[triggerToRemove]) {
                    await client.sendMessage(chatId, {
                        text: `❌ *Trigger not found*\n"${triggerToRemove}" is not configured.`,
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
                
                delete configToUpdate[triggerToRemove];
                await writeConfig(configToUpdate);
                
                await client.sendMessage(chatId, {
                    text: `✅ *Trigger removed*\n"${triggerToRemove}" has been removed from auto-sticker triggers.`,
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
                break;
                
            case 'upload':
                // Upload sticker to autosticker directory
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                
                if (!quotedMsg?.stickerMessage) {
                    await client.sendMessage(chatId, {
                        text: '❌ *Please reply to a sticker*\n\n*Usage:* Reply to a sticker with `.autosticker upload`\n\nThe sticker will be saved for auto-sticker triggers.',
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
                
                // Download the sticker
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                
                await client.sendMessage(chatId, {
                    text: '⬇️ *Downloading sticker...*',
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
                
                try {
                    const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'sticker');
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    const stickerBuffer = Buffer.concat(chunks);
                    
                    // Generate filename
                    const timestamp = Date.now();
                    const filename = `sticker_${timestamp}.webp`;
                    const filepath = path.join(STICKER_DIR, filename);
                    
                    // Save sticker
                    await fs.writeFile(filepath, stickerBuffer);
                    
                    await client.sendMessage(chatId, {
                        text: `✅ *Sticker uploaded*\n\n*Filename:* ${filename}\n*Size:* ${(stickerBuffer.length / 1024).toFixed(2)}KB\n\nNow you can use:\n\`.autosticker add <text> ${filename}\`\n\nExample:\n\`.autosticker add hello ${filename}\``,
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
                    
                } catch (error) {
                    console.error('Sticker upload error:', error);
                    await client.sendMessage(chatId, {
                        text: `❌ *Failed to upload sticker*\nError: ${error.message}`,
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
                break;
                
            case 'status':
            case 'info':
                // Show status info
                const currentConfigInfo = await readConfig();
                const stickerFiles = await listStickers();
                
                // Check if enabled
                let isEnabled = false;
                const stateFilePath = path.join(__dirname, '..', 'data', 'autosticker_state.json');
                if (fsSync.existsSync(stateFilePath)) {
                    try {
                        const stateData = JSON.parse(await fs.readFile(stateFilePath, 'utf8'));
                        isEnabled = stateData.enabled || false;
                    } catch {}
                }
                
                const infoText = `╭─❖ *🎭 AUTO-STICKER STATUS* ❖─
│
├─ *Status:* ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
├─ *Triggers configured:* ${Object.keys(currentConfigInfo).length}
├─ *Stickers available:* ${stickerFiles.length}
├─ *Config file:* data/autosticker.json
├─ *Sticker folder:* autos/autosticker/
│
├─ *Commands:*
│  ├─ .autosticker on/off - Toggle feature
│  ├─ .autosticker list - View triggers
│  └─ .autosticker add - Add trigger
│
╰─➤ _Use .autosticker on to enable_`;
                
                await client.sendMessage(chatId, {
                    text: infoText,
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
                break;
                
            default:
                await client.sendMessage(chatId, {
                    text: '❌ *Unknown subcommand*\nUse `.autosticker` to see available commands.',
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
        console.error('Autosticker command error:', error);
        await client.sendMessage(chatId, {
            text: `❌ *Error:* ${error.message}`,
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

// Function to check if auto-sticker is enabled
async function isAutostickerEnabled() {
    try {
        const stateFilePath = path.join(__dirname, '..', 'data', 'autosticker_state.json');
        if (!fsSync.existsSync(stateFilePath)) return false;
        const stateData = JSON.parse(await fs.readFile(stateFilePath, 'utf8'));
        return stateData.enabled || false;
    } catch {
        return false;
    }
}

// Function to check and send auto-stickers
async function checkAutoSticker(client, chatId, message, text) {
    try {
        // Check if auto-sticker is enabled
        const enabled = await isAutostickerEnabled();
        if (!enabled) return false;
        
        // Read config
        const config = await readConfig();
        const normalizedText = text.toLowerCase().trim();
        
        // Check for exact matches
        if (config[normalizedText]) {
            const stickerFile = config[normalizedText];
            const stickerPath = path.join(STICKER_DIR, stickerFile);
            
            if (fsSync.existsSync(stickerPath)) {
                const stickerBuffer = fsSync.readFileSync(stickerPath);
                
                await client.sendMessage(chatId, {
                    sticker: stickerBuffer,
                    packname: 'Auto-Sticker',
                    author: 'MAD-MAX'
                }, { quoted: message });
                
                return true;
            }
        }
        
        // Check for partial matches (if text contains trigger)
        for (const [trigger, stickerFile] of Object.entries(config)) {
            if (normalizedText.includes(trigger.toLowerCase())) {
                const stickerPath = path.join(STICKER_DIR, stickerFile);
                
                if (fsSync.existsSync(stickerPath)) {
                    const stickerBuffer = fsSync.readFileSync(stickerPath);
                    
                    await client.sendMessage(chatId, {
                        sticker: stickerBuffer,
                        packname: 'Auto-Sticker',
                        author: 'MAD-MAX'
                    }, { quoted: message });
                    
                    return true;
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('Auto-sticker check error:', error);
        return false;
    }
}

module.exports = {
    autostickerCommand,
    checkAutoSticker
};
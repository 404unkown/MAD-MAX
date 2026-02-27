const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Path to store antibadword settings
const ANTIBADWORD_PATH = path.join(__dirname, '../data/antibadword.json');

// Default bad words list
const DEFAULT_BAD_WORDS = ["wtf", "mia", "xxx", "fuck", "sex", "huththa", "kuma", "porn", "dick", "ass", "bitch", "bastard", "pussy", "matako", "shit"];

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(ANTIBADWORD_PATH)) {
    fs.writeFileSync(ANTIBADWORD_PATH, JSON.stringify({}, null, 2));
}

// Get antibadword setting for a group
async function getAntibadword(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTIBADWORD_PATH, 'utf8'));
        return data[groupId] || { enabled: false, words: DEFAULT_BAD_WORDS };
    } catch {
        return { enabled: false, words: DEFAULT_BAD_WORDS };
    }
}

// Set antibadword for a group
async function setAntibadword(groupId, enabled, customWords = null) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTIBADWORD_PATH, 'utf8'));
        const current = data[groupId] || { words: DEFAULT_BAD_WORDS };
        data[groupId] = { 
            enabled: !!enabled, 
            words: customWords || current.words 
        };
        fs.writeFileSync(ANTIBADWORD_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Add custom bad words
async function addBadWords(groupId, newWords) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTIBADWORD_PATH, 'utf8'));
        const current = data[groupId] || { enabled: false, words: DEFAULT_BAD_WORDS };
        const wordsArray = Array.isArray(newWords) ? newWords : [newWords];
        current.words = [...new Set([...current.words, ...wordsArray])];
        data[groupId] = current;
        fs.writeFileSync(ANTIBADWORD_PATH, JSON.stringify(data, null, 2));
        return current.words;
    } catch {
        return DEFAULT_BAD_WORDS;
    }
}

// Remove bad words
async function removeBadWords(groupId, wordsToRemove) {
    try {
        const data = JSON.parse(fs.readFileSync(ANTIBADWORD_PATH, 'utf8'));
        const current = data[groupId] || { enabled: false, words: DEFAULT_BAD_WORDS };
        const removeArray = Array.isArray(wordsToRemove) ? wordsToRemove : [wordsToRemove];
        current.words = current.words.filter(word => !removeArray.includes(word));
        data[groupId] = current;
        fs.writeFileSync(ANTIBADWORD_PATH, JSON.stringify(data, null, 2));
        return current.words;
    } catch {
        return DEFAULT_BAD_WORDS;
    }
}

// Main detection function
async function handleBadwordDetection(client, chatId, message, userMessage, senderId) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        
        if (!isGroup) return;

        // Get group settings
        const settings = await getAntibadword(chatId);
        if (!settings.enabled) return;

        // Check if sender is admin
        const adminStatus = await isAdmin(client, chatId, senderId);
        
        if (adminStatus.isSenderAdmin) {
            return; // Allow admins to use any words
        }

        const messageText = userMessage.toLowerCase();
        const containsBadWord = settings.words.some(word => messageText.includes(word.toLowerCase()));

        if (containsBadWord) {
            // Delete the bad message
            try {
                await client.sendMessage(chatId, { 
                    delete: message.key 
                });
            } catch (e) {
                console.error("Failed to delete message:", e);
            }
            
            // Send warning
            await client.sendMessage(chatId, {
                text: "🚫 *BAD WORDS NOT ALLOWED* 🚫\n\n🚫 Your message was deleted.\n⚠️ MIND YOUR LANGUAGE.",
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
            
            console.log(`[ANTIBADWORD] Deleted message from ${senderId} containing bad words`);
        }
    } catch (error) {
        console.error("Anti-badword error:", error);
    }
}

// Command handler for antibadword
async function antibadwordCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: "🚫 This command can only be used in groups!",
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

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, {
                text: "🚫 Only group admins can use this command!",
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

        const settings = await getAntibadword(chatId);
        const action = args[0]?.toLowerCase();

        if (!action) {
            const status = settings.enabled ? '✅ ON' : '🚫 OFF';
            const wordList = settings.words.slice(0, 10).join(', ') + (settings.words.length > 10 ? '...' : '');
            
            const helpText = `╭─❖ *ANTI-BAD WORD COMMANDS* ❖─
│
├─ *Status:* ${status}
├─ *Bad Words:* ${wordList}
│
├─ *Usage:* .antibadword <option>
│
├─ *Options:*
│  ├─ .antibadword on - Enable filter
│  ├─ .antibadword off - Disable filter
│  ├─ .antibadword status - Show status
│  ├─ .antibadword list - List all bad words
│  ├─ .antibadword add <word> - Add bad word
│  └─ .antibadword remove <word> - Remove bad word
│
╰─➤ _Only group admins can use this_`;

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

        switch (action) {
            case 'on':
            case 'enable':
                if (settings.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Anti-bad word is already enabled*',
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
                await setAntibadword(chatId, true);
                await client.sendMessage(chatId, { 
                    text: '✅ *Anti-bad word has been ENABLED*\n\nInappropriate messages will be automatically deleted.',
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
                if (!settings.enabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Anti-bad word is already disabled*',
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
                await setAntibadword(chatId, false);
                await client.sendMessage(chatId, { 
                    text: '🚫 *Anti-bad word has been DISABLED*',
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

            case 'status':
                const status = settings.enabled ? '✅ ON' : '🚫 OFF';
                await client.sendMessage(chatId, { 
                    text: `📊 *ANTI-BAD WORD STATUS*\n\nStatus: ${status}\nTotal Bad Words: ${settings.words.length}`,
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
                const wordList = settings.words.map((w, i) => `${i+1}. ${w}`).join('\n');
                await client.sendMessage(chatId, { 
                    text: `📝 *BAD WORDS LIST*\n\n${wordList}\n\nTotal: ${settings.words.length}`,
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
                const wordToAdd = args[1]?.toLowerCase();
                if (!wordToAdd) {
                    await client.sendMessage(chatId, { 
                        text: '🚫 *Usage:* .antibadword add <word>',
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
                const newWords = await addBadWords(chatId, wordToAdd);
                await client.sendMessage(chatId, { 
                    text: `✅ *Word added:* "${wordToAdd}"\n\nTotal bad words: ${newWords.length}`,
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
                const wordToRemove = args[1]?.toLowerCase();
                if (!wordToRemove) {
                    await client.sendMessage(chatId, { 
                        text: '🚫 *Usage:* .antibadword remove <word>',
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
                const remainingWords = await removeBadWords(chatId, wordToRemove);
                await client.sendMessage(chatId, { 
                    text: `✅ *Word removed:* "${wordToRemove}"\n\nTotal bad words: ${remainingWords.length}`,
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
                    text: '🚫 *Invalid option!*\n\nUse `.antibadword` to see available commands.',
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
        console.error("Anti-badword command error:", error);
        await client.sendMessage(chatId, {
            text: '🚫 *Error processing antibadword command*',
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

module.exports = {
    handleBadwordDetection,
    antibadwordCommand
};
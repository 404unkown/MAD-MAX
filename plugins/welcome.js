const fetch = require('node-fetch');
const isAdmin = require('../lib/isAdmin');

// Path to store welcome settings
const fs = require('fs');
const path = require('path');
const WELCOME_PATH = path.join(__dirname, '../data/welcome.json');

// Global channel info
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363401269012709@newsletter',
            newsletterName: 'MAD-MAX',
            serverMessageId: -1
        }
    }
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(WELCOME_PATH)) {
    fs.writeFileSync(WELCOME_PATH, JSON.stringify({}, null, 2));
}

// Check if welcome is enabled for a group
async function isWelcomeOn(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8'));
        return data[groupId]?.enabled || false;
    } catch {
        return false;
    }
}

// Get welcome message for a group
async function getWelcome(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8'));
        return data[groupId]?.message || null;
    } catch {
        return null;
    }
}

// Set welcome settings for a group
async function setWelcome(groupId, enabled, message) {
    try {
        const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8'));
        data[groupId] = { 
            enabled: !!enabled, 
            message: message || null 
        };
        fs.writeFileSync(WELCOME_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Remove welcome settings for a group
async function removeWelcome(groupId) {
    try {
        const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf8'));
        delete data[groupId];
        fs.writeFileSync(WELCOME_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch {
        return false;
    }
}

// Main command handler
async function welcomeCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const action = args[0]?.toLowerCase();
        const customMessage = args.slice(1).join(' ');

        if (!action) {
            const status = await isWelcomeOn(chatId) ? '✅ ON' : '❌ OFF';
            const currentMessage = await getWelcome(chatId) || 'Not set';
            
            const helpText = `╭─❖ *WELCOME COMMANDS* ❖─
│
├─ *Status:* ${status}
├─ *Current Message:* ${currentMessage}
│
├─ *Usage:* .welcome <option> [message]
│
├─ *Options:*
│  ├─ .welcome on - Enable welcome
│  ├─ .welcome off - Disable welcome
│  ├─ .welcome set <message> - Set custom message
│  └─ .welcome status - Check settings
│
├─ *Variables:*
│  ├─ {user} - Member's name
│  ├─ {group} - Group name
│  └─ {description} - Group description
│
├─ *Example:*
│  └─ .welcome set Welcome {user} to {group}! 🎉
│
╰─➤ _Only group admins can use this_`;

            await client.sendMessage(chatId, { 
                text: helpText,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        switch (action) {
            case 'on':
            case 'enable':
                const isEnabled = await isWelcomeOn(chatId);
                if (isEnabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Welcome is already enabled*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                const currentMsg = await getWelcome(chatId);
                await setWelcome(chatId, true, currentMsg);
                await client.sendMessage(chatId, { 
                    text: '✅ *Welcome has been ENABLED*\n\nWelcome messages will now be sent when new members join.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'off':
            case 'disable':
                const isCurrentlyEnabled = await isWelcomeOn(chatId);
                if (!isCurrentlyEnabled) {
                    await client.sendMessage(chatId, { 
                        text: '⚠️ *Welcome is already disabled*',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '⚠️', key: message.key } 
                    });
                    return;
                }
                await setWelcome(chatId, false, null);
                await client.sendMessage(chatId, { 
                    text: '❌ *Welcome has been DISABLED*',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'set':
                if (!customMessage) {
                    await client.sendMessage(chatId, { 
                        text: '❌ *Please provide a message!*\n\nExample: .welcome set Welcome {user} to {group}! 🎉',
                        ...channelInfo
                    }, { quoted: message });
                    await client.sendMessage(chatId, { 
                        react: { text: '❌', key: message.key } 
                    });
                    return;
                }
                const currentStatus = await isWelcomeOn(chatId);
                await setWelcome(chatId, currentStatus, customMessage);
                await client.sendMessage(chatId, { 
                    text: `✅ *Welcome message set!*\n\nMessage: ${customMessage}`,
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            case 'status':
                const status = await isWelcomeOn(chatId) ? '✅ ON' : '❌ OFF';
                const messageText = await getWelcome(chatId) || 'Default message';
                await client.sendMessage(chatId, { 
                    text: `📊 *WELCOME STATUS*\n\nEnabled: ${status}\nMessage: ${messageText}`,
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                break;

            default:
                await client.sendMessage(chatId, { 
                    text: '❌ *Invalid option!*\n\nUse `.welcome` to see available commands.',
                    ...channelInfo
                }, { quoted: message });
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
        }
    } catch (error) {
        console.error('Error in welcome command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ *Error processing welcome command*',
            ...channelInfo
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// Handle join events
async function handleJoinEvent(client, id, participants) {
    try {
        // Check if welcome is enabled for this group
        const isWelcomeEnabled = await isWelcomeOn(id);
        if (!isWelcomeEnabled) return;

        // Get custom welcome message
        const customMessage = await getWelcome(id);

        // Get group metadata
        const groupMetadata = await client.groupMetadata(id);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'No description available';

        // Send welcome message for each new participant
        for (const participant of participants) {
            try {
                // Handle participant JID
                const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                const user = participantString.split('@')[0];
                
                // Get user's display name
                let displayName = user;
                try {
                    // Try to get from group participants
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find(p => p.id === participantString);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                } catch (nameError) {
                    console.log('Could not fetch display name, using phone number');
                }
                
                // Process custom message with variables
                let finalMessage;
                if (customMessage) {
                    finalMessage = customMessage
                        .replace(/{user}/g, `@${displayName}`)
                        .replace(/{group}/g, groupName)
                        .replace(/{description}/g, groupDesc);
                } else {
                    // Default welcome message
                    const now = new Date();
                    const timeString = now.toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                    
                    finalMessage = `╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮
┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${displayName} 👋
┃Member count: ${groupMetadata.participants.length}
┃𝚃𝙸𝙼𝙴: ${timeString}⏰
╰━━━━━━━━━━━━━━━╯

*@${displayName}* Welcome to *${groupName}*! 🎉

*Group Description*
${groupDesc}

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ MAD-MAX*`;
                }
                
                // Try to send with image first
                try {
                    // Get user profile picture
                    let profilePicUrl = 'https://img.pyrocdn.com/dbKUgahg.png'; // Default avatar
                    try {
                        const profilePic = await client.profilePictureUrl(participantString, 'image');
                        if (profilePic) {
                            profilePicUrl = profilePic;
                        }
                    } catch (profileError) {
                        console.log('Could not fetch profile picture, using default');
                    }
                    
                    // Try to generate welcome image
                    const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                    
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const imageBuffer = await response.buffer();
                        
                        await client.sendMessage(id, {
                            image: imageBuffer,
                            caption: finalMessage,
                            mentions: [participantString],
                            ...channelInfo
                        });
                        continue;
                    }
                } catch (imageError) {
                    console.log('Image generation failed, falling back to text');
                }
                
                // Send text message
                await client.sendMessage(id, {
                    text: finalMessage,
                    mentions: [participantString],
                    ...channelInfo
                });
                
            } catch (error) {
                console.error('Error sending welcome message:', error);
                // Simple fallback
                const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                const user = participantString.split('@')[0];
                
                await client.sendMessage(id, {
                    text: `👋 Welcome @${user} to the group!`,
                    mentions: [participantString],
                    ...channelInfo
                });
            }
        }
    } catch (error) {
        console.error('Error in handleJoinEvent:', error);
    }
}

module.exports = { 
    welcomeCommand, 
    handleJoinEvent 
};
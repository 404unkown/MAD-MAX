const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

// Global channel info (assuming it's set in main.js)
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

// Path to banned users file
const BANNED_PATH = path.join(__dirname, '../data/banned.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize banned file if it doesn't exist
if (!fs.existsSync(BANNED_PATH)) {
    fs.writeFileSync(BANNED_PATH, JSON.stringify([], null, 2));
}

async function unbanCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        
        // Check permissions based on chat type using lib functions
        if (isGroup) {
            const adminStatus = await isAdmin(client, chatId, sender);
            
            if (!adminStatus.isBotAdmin) {
                await client.sendMessage(chatId, { 
                    text: '❌ Please make the bot an admin to use .unban',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            
            if (!adminStatus.isSenderAdmin && !isOwner) {
                await client.sendMessage(chatId, { 
                    text: '❌ Only group admins can use .unban',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
        } else {
            const senderIsSudo = await isSudo(sender);
            if (!isOwner && !senderIsSudo) {
                await client.sendMessage(chatId, { 
                    text: '❌ Only owner/sudo can use .unban in private chat',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
        }
        
        let userToUnban;
        
        // Check for mentioned users
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentionedJids.length > 0) {
            userToUnban = mentionedJids[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToUnban = message.message.extendedTextMessage.contextInfo.participant;
        }
        // Check if user provided a number in args
        else if (args && args.length > 0) {
            const phoneNumber = args[0].replace(/[^0-9]/g, '');
            if (phoneNumber) {
                userToUnban = `${phoneNumber}@s.whatsapp.net`;
            }
        }
        
        if (!userToUnban) {
            await client.sendMessage(chatId, { 
                text: '📝 *UNBAN COMMAND*\n\n*Usage:* .unban @user or reply to user\'s message\n\n*Example:* .unban @1234567890',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        try {
            // Read banned users
            let bannedUsers = [];
            try {
                bannedUsers = JSON.parse(fs.readFileSync(BANNED_PATH, 'utf8'));
            } catch (e) {
                bannedUsers = [];
            }
            
            const index = bannedUsers.indexOf(userToUnban);
            const userMention = `@${userToUnban.split('@')[0]}`;
            
            if (index > -1) {
                bannedUsers.splice(index, 1);
                fs.writeFileSync(BANNED_PATH, JSON.stringify(bannedUsers, null, 2));
                
                await client.sendMessage(chatId, { 
                    text: `✅ *USER UNBANNED*\n\n${userMention} has been successfully unbanned!`,
                    mentions: [userToUnban],
                    ...channelInfo 
                }, { quoted: message });
                
                // Add success reaction
                await client.sendMessage(chatId, {
                    react: { text: '✅', key: message.key }
                });
                
            } else {
                await client.sendMessage(chatId, { 
                    text: `❌ ${userMention} is not in the banned list!`,
                    mentions: [userToUnban],
                    ...channelInfo 
                }, { quoted: message });
                
                await client.sendMessage(chatId, {
                    react: { text: '❌', key: message.key }
                });
            }
        } catch (error) {
            console.error('Error in unban command:', error);
            await client.sendMessage(chatId, { 
                text: '❌ Failed to unban user!',
                ...channelInfo 
            }, { quoted: message });
            
            await client.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });
        }
        
    } catch (error) {
        console.error('Error in unban command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to process unban command!',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = unbanCommand;
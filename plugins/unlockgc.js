// commands/unlockgc.js
const fs = require('fs');
const path = require('path');

// Import isAdmin
const isAdmin = require('../lib/isAdmin');

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

async function unlockgcCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });
        
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Check admin status
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        if (!adminStatus.isBotAdmin) {
            await client.sendMessage(chatId, {
                text: '❌ Bot must be admin to use this command!',
                ...channelInfo
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Unlock the group (allow all members to send messages)
        await client.groupSettingUpdate(chatId, 'not_announcement');
        
        await client.sendMessage(chatId, {
            text: "╭─❖ *GROUP UNLOCKED* ❖─\n│\n├─ ✅ *Group messaging has been unlocked!*\n│\n├─ 🔓 *Anyone can now send messages*\n│\n╰─➤ _Action by: ${pushName}_",
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
        
        console.log(`[UNLOCKGC] Group ${chatId} unlocked by ${sender}`);
        
    } catch (error) {
        console.error("Unlock group error:", error);
        
        let errorMessage = '❌ Failed to unlock group!';
        if (error.message.includes('not an admin')) {
            errorMessage = '❌ Bot is not an admin!';
        } else if (error.message.includes('404')) {
            errorMessage = '❌ Group not found!';
        }
        
        await client.sendMessage(chatId, {
            text: `${errorMessage}\n\nError: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = unlockgcCommand;
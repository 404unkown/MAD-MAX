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

async function unmuteCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check admin status
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!adminStatus.isBotAdmin) {
            await client.sendMessage(chatId, { 
                text: '❌ Please make the bot an admin first.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use the unmute command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Unmute the group (allow all members to send messages)
        await client.groupSettingUpdate(chatId, 'not_announcement');
        
        await client.sendMessage(chatId, { 
            text: `╭─❖ *GROUP UNMUTED* ❖─
│
├─ 🔊 Group has been unmuted successfully!
│
├─ ✅ *All members can now send messages*
│
╰─➤ _Action by: ${pushName}_`,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        console.log(`[UNMUTE] Group ${chatId} unmuted by ${sender}`);

    } catch (error) {
        console.error('Error unmuting group:', error);
        
        let errorMessage = '❌ An error occurred while unmuting the group.';
        if (error.message.includes('not an admin')) {
            errorMessage = '❌ Bot is not an admin or was demoted.';
        } else if (error.message.includes('404')) {
            errorMessage = '❌ Group not found.';
        }
        
        await client.sendMessage(chatId, { 
            text: errorMessage,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = unmuteCommand;
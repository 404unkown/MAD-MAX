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

async function tagNotAdminCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if user is admin
        const adminStatus = await isAdmin(client, chatId, sender);
        const isSenderAdmin = adminStatus.isSenderAdmin;
        
        if (!isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use the .tagnotadmin command!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await client.sendMessage(chatId, { 
                text: '❌ No participants found in the group.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Filter non-admin members
        const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);

        if (nonAdmins.length === 0) {
            await client.sendMessage(chatId, { 
                text: 'ℹ️ No non-admin members to tag.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get custom message from args
        const customMessage = args.join(' ').trim();

        // Create message with each member on a new line
        let messageText = '';
        
        if (customMessage) {
            messageText = `╭─❖ *TAG NON-ADMINS* ❖─
│
├─ *Message:* ${customMessage}
│
├─ *Non-Admin Members (${nonAdmins.length}):*
${nonAdmins.map(jid => `├─ @${jid.split('@')[0]}`).join('\n')}
│
╰─➤ _Tagged by: ${pushName}_`;
        } else {
            messageText = `╭─❖ *TAG NON-ADMINS* ❖─
│
├─ *Hello Non-Admin Members!* 👋
│
├─ *Non-Admin Members (${nonAdmins.length}):*
${nonAdmins.map(jid => `├─ @${jid.split('@')[0]}`).join('\n')}
│
╰─➤ _Tagged by: ${pushName}_`;
        }

        // Send message with mentions
        await client.sendMessage(chatId, {
            text: messageText,
            mentions: nonAdmins,
            ...channelInfo
        });

        // Add success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('Error in tagnotadmin command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to tag non-admin members.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = tagNotAdminCommand;
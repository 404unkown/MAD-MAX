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

async function tagAllCommand(client, chatId, message, args, sender, pushName, isOwner) {
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
                text: '❌ Only group admins can use the .tagall command!',
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

        // Get custom message from args
        const customMessage = args.join(' ').trim();

        // Create message with each member on a new line
        let messageText = '';
        
        if (customMessage) {
            messageText = `╭─❖ *TAG ALL* ❖─
│
├─ *Message:* ${customMessage}
│
├─ *Members:*
${participants.map(p => `├─ @${p.id.split('@')[0]}`).join('\n')}
│
╰─➤ _Total: ${participants.length} members_`;
        } else {
            messageText = `╭─❖ *TAG ALL* ❖─
│
├─ *Hello Everyone!* 👋
│
├─ *Members:*
${participants.map(p => `├─ @${p.id.split('@')[0]}`).join('\n')}
│
╰─➤ _Total: ${participants.length} members_`;
        }

        // Send message with mentions
        await client.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id),
            ...channelInfo
        });

        // Add success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to tag all members.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = tagAllCommand;
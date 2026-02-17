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

// EXTRA BOT ADMIN CHECK
async function isBotAdminCheck(client, chatId) {
    try {
        const metadata = await client.groupMetadata(chatId);
        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = metadata.participants.find(p => p.id === botId);
        return bot?.admin === 'admin' || bot?.admin === 'superadmin';
    } catch (error) {
        console.error('Error checking bot admin:', error);
        return false;
    }
}

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

        // Check if bot is admin
        const isBotAdmin = await isBotAdminCheck(client, chatId);

        if (!isBotAdmin) {
            await client.sendMessage(chatId, { 
                text: '⚠️ Please make the bot an admin first to use this command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use the .tagnotadmin command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];

        // Filter non-admin members
        const nonAdmins = participants
            .filter(p => !p.admin)
            .map(p => p.id);

        if (nonAdmins.length === 0) {
            await client.sendMessage(chatId, { 
                text: 'ℹ️ No non-admin members to tag.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get custom message from args
        const customMessage = args.join(' ').trim();

        // Create message
        let text = '';
        if (customMessage) {
            text = `╭─❖ *TAG NON-ADMINS* ❖─
│
├─ *Message:* ${customMessage}
│
├─ *Non-Admin Members (${nonAdmins.length}):*
${nonAdmins.map(jid => `├─ @${jid.split('@')[0]}`).join('\n')}
│
╰─➤ _Tagged by: ${pushName}_`;
        } else {
            text = `╭─❖ *TAG NON-ADMINS* ❖─
│
├─ *Hello Non-Admin Members!* 👋
│
├─ *Members (${nonAdmins.length}):*
${nonAdmins.map(jid => `├─ @${jid.split('@')[0]}`).join('\n')}
│
╰─➤ _Tagged by: ${pushName}_`;
        }

        // Send message with mentions
        await client.sendMessage(chatId, {
            text: text,
            mentions: nonAdmins,
            ...channelInfo
        }, { quoted: message });

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
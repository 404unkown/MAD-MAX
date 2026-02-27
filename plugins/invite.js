const config = require('../set');
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

async function inviteCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if it's a group
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

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🔗', key: message.key } 
        });

        // Check if bot is admin using isAdmin library
        const botAdminStatus = await isAdmin(client, chatId, client.user.id);
        if (!botAdminStatus.isSenderAdmin) {
            await client.sendMessage(chatId, {
                text: '❌ Bot needs to be admin to get the group link!',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Check if sender is admin using isAdmin library
        const senderAdminStatus = await isAdmin(client, chatId, sender);
        if (!senderAdminStatus.isSenderAdmin && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Get the invite code
        const inviteCode = await client.groupInviteCode(chatId);
        
        if (!inviteCode) {
            await client.sendMessage(chatId, {
                text: '❌ Failed to retrieve the invite code.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // Send the invite link
        await client.sendMessage(chatId, {
            text: `🔗 *GROUP INVITE LINK*\n\n${inviteLink}\n\n📌 *Note:* This link can be shared with anyone to join the group.`,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Invite Command Error:", error);
        
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message || "Unknown error"}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = inviteCommand;
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

async function resetlinkCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '🚫 This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if sender is admin - just like antilink.js
        const adminStatus = await isAdmin(client, chatId, sender);
        const isSenderAdmin = adminStatus.isSenderAdmin;

        if (!isSenderAdmin && !isOwnerSimple) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // REMOVED: No bot admin check here!
        // The command will fail gracefully if bot isn't admin

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Reset the group link - this will throw an error if bot isn't admin
const newCode = await client.groupRevokeInvite(chatId);

// Don't send the new link - just confirm it was reset
await client.sendMessage(chatId, { 
    text: `✅ *Group link has been successfully reset*\n\n🎉🎉.`,
    ...channelInfo
}, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in resetlink command:', error);
        
        // Check if error is because bot isn't admin
        if (error.message?.includes('not-authorized') || error.message?.includes('admin')) {
            await client.sendMessage(chatId, { 
                text: '❌ Bot needs to be admin to reset the group link!',
                ...channelInfo
            }, { quoted: message });
        } else {
            await client.sendMessage(chatId, { 
                text: '❌ Failed to reset group link!',
                ...channelInfo
            }, { quoted: message });
        }
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = resetlinkCommand;
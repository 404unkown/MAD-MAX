const config = require('../set');

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

// Sleep function if you don't have one in your lib
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function leaveCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Check if sender is bot owner
        const isOwner = require('../lib/isOwner');
        const isUserOwner = await isOwner(sender, client, chatId);
        
        // Get bot owner's number from connection
        const botOwner = client.user.id.split(":")[0] + '@s.whatsapp.net';
        const isBotOwnerSender = sender === botOwner;

        if (!isUserOwner && !isBotOwnerSender && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only the bot owner can use this command.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎉', key: message.key } 
        });

        // Notify that bot is leaving
        await client.sendMessage(chatId, {
            text: '👋 *Leaving group...*\n\nGoodbye everyone!',
            ...channelInfo
        }, { quoted: message });

        // Wait a moment before leaving
        await sleep(2000);

        // Leave the group
        await client.groupLeave(chatId);
        
        // Note: Any code after groupLeave won't execute because the bot leaves the group
        // So we don't need to send success message here

    } catch (error) {
        console.error("Leave Command Error:", error);
        
        // Try to send error message if still in group
        try {
            await client.sendMessage(chatId, {
                text: `❌ Failed to leave group: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        } catch (e) {
            // If we can't send message, just log it
            console.log("Could not send error message, bot might already be out of group");
        }
    }
}

module.exports = leaveCommand;
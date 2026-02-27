const config = require('../set');
const isOwner = require('../lib/isOwner');

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

// Helper function to check if a string is a URL
function isUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

async function joinCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if sender is owner (ONLY owner can use join command)
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only bot owner can use this command!',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const q = args.join(" ");
        
        // Check if there's a quoted message with a link
        let groupLink = null;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // If quoted message exists and it has conversation text that is a URL
        if (quotedMsg?.conversation && isUrl(quotedMsg.conversation)) {
            const fullLink = quotedMsg.conversation;
            const match = fullLink.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
            if (match && match[1]) {
                groupLink = match[1];
            }
        } 
        // If args contain a URL
        else if (q && isUrl(q)) {
            const match = q.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
            if (match && match[1]) {
                groupLink = match[1];
            }
        }

        if (!groupLink) {
            await client.sendMessage(chatId, {
                text: '📬 *JOIN COMMAND*\n\nPlease provide a valid group invite link.\n\n*Usage:*\n.join https://chat.whatsapp.com/xxxxxx\n\n*Or reply to a group invite link with:* .join',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📬', key: message.key } 
        });

        // Accept the group invite
        await client.groupAcceptInvite(groupLink);
        
        await client.sendMessage(chatId, {
            text: '✅ *Successfully Joined the Group!*',
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Join Command Error:", error);
        
        // Check for specific error messages
        let errorMsg = '❌ Failed to join group.';
        if (error.message?.includes('409')) {
            errorMsg = '❌ Already in the group or invite link is invalid.';
        } else if (error.message?.includes('401')) {
            errorMsg = '❌ Invite link has expired.';
        } else if (error.message?.includes('404')) {
            errorMsg = '❌ Invalid group link.';
        }
        
        await client.sendMessage(chatId, {
            text: errorMsg,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = joinCommand;
// Global channel info (to match your main.js)
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

async function blockCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if sender is owner using the isOwner function
        const isOwnerFn = require('../lib/isOwner');
        const isUserOwner = await isOwnerFn(sender, client, chatId);
        const config = require('../set');
        const isOwnerSimple = sender === config.owner + '@s.whatsapp.net' || sender === client.user.id;

        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: "❌ Only the bot owner can use this command.",
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Get target user from reply
        let targetJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        
        if (quotedMsg?.participant) {
            // Replying to a message in group
            targetJid = quotedMsg.participant;
        } else if (quotedMsg?.quotedMessage) {
            // Replying to a message in DM
            targetJid = message.key.remoteJid;
        } else if (args[0]) {
            // Try by phone number as fallback
            const phone = args[0].replace(/[^0-9]/g, '');
            if (phone.length >= 10) {
                targetJid = phone + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            await client.sendMessage(chatId, {
                text: "❌ *BLOCK COMMAND*\n\nPlease reply to someone's message with `.block` to block them.\n\n*Usage:*\n• Reply to message with .block\n• .block 254123456789",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Don't allow blocking self
        if (targetJid === sender) {
            await client.sendMessage(chatId, {
                text: "❌ You cannot block yourself!",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Don't allow blocking the bot
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetJid === botJid) {
            await client.sendMessage(chatId, {
                text: "❌ You cannot block the bot! 🤖",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Block the user
        await client.updateBlockStatus(targetJid, "block");
        
        await client.sendMessage(chatId, {
            text: `🚫 *USER BLOCKED*\n\nSuccessfully blocked @${targetJid.split("@")[0]}`,
            mentions: [targetJid],
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Block command error:", error);
        await client.sendMessage(chatId, {
            text: "❌ Failed to block the user. Make sure they exist and try again.",
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

async function unblockCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if sender is owner using the isOwner function
        const isOwnerFn = require('../lib/isOwner');
        const isUserOwner = await isOwnerFn(sender, client, chatId);
        const config = require('../set');
        const isOwnerSimple = sender === config.owner + '@s.whatsapp.net' || sender === client.user.id;

        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: "❌ Only the bot owner can use this command.",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Get target user from reply
        let targetJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        
        if (quotedMsg?.participant) {
            // Replying to a message in group
            targetJid = quotedMsg.participant;
        } else if (quotedMsg?.quotedMessage) {
            // Replying to a message in DM
            targetJid = message.key.remoteJid;
        } else if (args[0]) {
            // Try by phone number as fallback
            const phone = args[0].replace(/[^0-9]/g, '');
            if (phone.length >= 10) {
                targetJid = phone + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            await client.sendMessage(chatId, {
                text: "❌ *UNBLOCK COMMAND*\n\nPlease reply to someone's message with `.unblock` to unblock them.\n\n*Usage:*\n• Reply to message with .unblock\n• .unblock 254123456789",
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Unblock the user
        await client.updateBlockStatus(targetJid, "unblock");
        
        await client.sendMessage(chatId, {
            text: `🔓 *USER UNBLOCKED*\n\nSuccessfully unblocked @${targetJid.split("@")[0]}`,
            mentions: [targetJid],
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Unblock command error:", error);
        await client.sendMessage(chatId, {
            text: "❌ Failed to unblock the user.",
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = {
    blockCommand,
    unblockCommand
};
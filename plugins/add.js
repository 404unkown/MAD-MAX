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

async function addCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
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

        // NO BOT ADMIN CHECK HERE - main.js already handles it!

        // Check if sender is group admin - ONLY admin check, no owner check
        const senderAdminStatus = await isAdmin(client, chatId, sender);
        if (!senderAdminStatus.isSenderAdmin) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Get the number to add
        let number;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        
        if (quotedMsg?.participant) {
            // Replying to a message
            number = quotedMsg.participant.split('@')[0];
        } else if (quotedMsg?.mentionedJid && quotedMsg.mentionedJid.length > 0) {
            // Mentioned user
            number = quotedMsg.mentionedJid[0].split('@')[0];
        } else if (args[0]) {
            // Direct number in args
            number = args[0].replace(/[^0-9]/g, '');
        }

        if (!number || number.length < 9) {
            await client.sendMessage(chatId, {
                text: '❌ *ADD MEMBER*\n\nPlease provide a number to add.\n\n*Usage:*\n• Reply to message: .add\n• Mention user: .add @user\n• Type number: .add 254769769295',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        const jid = number + "@s.whatsapp.net";

        // Add the member
        await client.groupParticipantsUpdate(chatId, [jid], "add");
        
        await client.sendMessage(chatId, { 
            text: `✅ Successfully added @${number}`,
            mentions: [jid],
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Add Command Error:", error);
        
        let errorMsg = '❌ Failed to add member.';
        if (error.message?.includes('not-authorized')) {
            errorMsg = '❌ Bot is not authorized to add members.';
        } else if (error.message?.includes('privacy')) {
            errorMsg = '❌ User\'s privacy settings prevent being added.';
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

module.exports = addCommand;
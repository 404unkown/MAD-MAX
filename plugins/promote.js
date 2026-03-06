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

// Function to handle manual promotions via command
async function promoteCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
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
                text: '❌ Please make the bot an admin first to use this command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use the promote command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        let userToPromote = [];
        
        // Check for mentioned users
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentionedJids && mentionedJids.length > 0) {
            userToPromote = mentionedJids;
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        // Check if user provided numbers in args
        else if (args && args.length > 0) {
            userToPromote = args.map(arg => {
                const num = arg.replace(/[^0-9]/g, '');
                return num ? `${num}@s.whatsapp.net` : null;
            }).filter(jid => jid !== null);
        }
        
        // If no user found through any method
        if (userToPromote.length === 0) {
            await client.sendMessage(chatId, { 
                text: '📝 *PROMOTE COMMAND*\n\n*Usage:* .promote @user or reply to user\'s message\n\n*Example:* .promote @1234567890',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if trying to promote bot
        const botId = client.user?.id || '';
        if (userToPromote.includes(botId)) {
            await client.sendMessage(chatId, { 
                text: "❌ I can't promote myself! 🤖",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if users are already admins
        const groupMetadata = await client.groupMetadata(chatId);
        const existingAdmins = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id);
        
        const alreadyAdmins = userToPromote.filter(jid => existingAdmins.includes(jid));
        
        if (alreadyAdmins.length > 0) {
            const adminNames = alreadyAdmins.map(jid => `@${jid.split('@')[0]}`).join(', ');
            await client.sendMessage(chatId, { 
                text: `⚠️ ${adminNames} ${alreadyAdmins.length > 1 ? 'are' : 'is'} already an admin!`,
                mentions: alreadyAdmins,
                ...channelInfo
            }, { quoted: message });
            
            // Remove already admins from promotion list
            userToPromote = userToPromote.filter(jid => !alreadyAdmins.includes(jid));
            
            if (userToPromote.length === 0) {
                await client.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                return;
            }
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Promote users
        await client.groupParticipantsUpdate(chatId, userToPromote, "promote");
        
        // Get usernames for each promoted user
        const usernames = userToPromote.map(jid => `@${jid.split('@')[0]}`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const promotionMessage = `╭─❖ *GROUP PROMOTION* ❖─
│
├─ 👥 *Promoted User${userToPromote.length > 1 ? 's' : ''}:*
│  ${usernames.map(name => `├─ ${name}`).join('\n')}
│
├─ 👑 *Promoted By:* @${sender.split('@')[0]}
│
├─ 📅 *Date:* ${new Date().toLocaleString()}
│
╰─➤ _Action by: ${pushName}_`;
        
        await client.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, sender],
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        console.log(`[PROMOTE] ${userToPromote.length} user(s) promoted by ${sender}`);

    } catch (error) {
        console.error('Error in promote command:', error);
        
        let errorMessage = '❌ Failed to promote user(s)!';
        if (error.data === 429) {
            errorMessage = '❌ Rate limit reached. Please try again in a few seconds.';
        } else if (error.message.includes('not-authorized')) {
            errorMessage = '❌ Bot lacks permission to promote. Make sure I have admin rights.';
        } else if (error.message.includes('group-not-found')) {
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

// Function to handle automatic promotion detection
async function handlePromotionEvent(client, groupId, participants, author) {
    try {
        // Safety check for participants
        if (!Array.isArray(participants) || participants.length === 0) {
            return;
        }

        // Get usernames for promoted participants
        const promotedUsernames = await Promise.all(participants.map(async jid => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]}`;
        }));

        let promotedBy;
        let mentionList = participants.map(jid => {
            return typeof jid === 'string' ? jid : (jid.id || jid.toString());
        });

        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = 'System';
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const promotionMessage = `╭─❖ *GROUP PROMOTION* ❖─
│
├─ 👥 *Promoted User${participants.length > 1 ? 's' : ''}:*
│  ${promotedUsernames.map(name => `├─ ${name}`).join('\n')}
│
├─ 👑 *Promoted By:* ${promotedBy}
│
├─ 📅 *Date:* ${new Date().toLocaleString()}
│
╰─➤ _Event detected_`;
        
        await client.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList,
            ...channelInfo
        });
        
        console.log(`[PROMOTE EVENT] ${participants.length} user(s) promoted in ${groupId}`);
        
    } catch (error) {
        console.error('Error handling promotion event:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };
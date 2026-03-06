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

async function demoteCommand(client, chatId, message, args, sender, pushName, isOwner) {
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
                text: '❌ Only group admins can use the demote command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        let userToDemote = [];
        
        // Check for mentioned users
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        // Check if user provided numbers in args
        else if (args && args.length > 0) {
            userToDemote = args.map(arg => {
                const num = arg.replace(/[^0-9]/g, '');
                return num ? `${num}@s.whatsapp.net` : null;
            }).filter(jid => jid !== null);
        }
        
        // If no user found through any method
        if (userToDemote.length === 0) {
            await client.sendMessage(chatId, { 
                text: '📝 *DEMOTE COMMAND*\n\n*Usage:* .demote @user or reply to user\'s message\n\n*Example:* .demote @1234567890',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if trying to demote bot
        const botId = client.user?.id || '';
        if (userToDemote.includes(botId)) {
            await client.sendMessage(chatId, { 
                text: "❌ I can't demote myself! 🤖",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if users are already not admins
        const groupMetadata = await client.groupMetadata(chatId);
        const existingAdmins = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id);
        
        const notAdmins = userToDemote.filter(jid => !existingAdmins.includes(jid));
        
        if (notAdmins.length > 0) {
            const nonAdminNames = notAdmins.map(jid => `@${jid.split('@')[0]}`).join(', ');
            await client.sendMessage(chatId, { 
                text: `⚠️ ${nonAdminNames} ${notAdmins.length > 1 ? 'are' : 'is'} not an admin!`,
                mentions: notAdmins,
                ...channelInfo
            }, { quoted: message });
            
            // Remove non-admins from demotion list
            userToDemote = userToDemote.filter(jid => !notAdmins.includes(jid));
            
            if (userToDemote.length === 0) {
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

        // Demote users
        await client.groupParticipantsUpdate(chatId, userToDemote, "demote");
        
        // Get usernames for each demoted user
        const usernames = userToDemote.map(jid => `@${jid.split('@')[0]}`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `╭─❖ *GROUP DEMOTION* ❖─
│
├─ 👤 *Demoted User${userToDemote.length > 1 ? 's' : ''}:*
│  ${usernames.map(name => `├─ ${name}`).join('\n')}
│
├─ 👑 *Demoted By:* @${sender.split('@')[0]}
│
├─ 📅 *Date:* ${new Date().toLocaleString()}
│
╰─➤ _Action by: ${pushName}_`;
        
        await client.sendMessage(chatId, { 
            text: demotionMessage,
            mentions: [...userToDemote, sender],
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        console.log(`[DEMOTE] ${userToDemote.length} user(s) demoted by ${sender}`);

    } catch (error) {
        console.error('Error in demote command:', error);
        
        let errorMessage = '❌ Failed to demote user(s).';
        if (error.data === 429) {
            errorMessage = '❌ Rate limit reached. Please try again in a few seconds.';
        } else if (error.message.includes('not-authorized')) {
            errorMessage = '❌ Bot lacks permission to demote. Make sure I have admin rights.';
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

// Function to handle automatic demotion detection
async function handleDemotionEvent(client, groupId, participants, author) {
    try {
        // Safety check for participants
        if (!Array.isArray(participants) || participants.length === 0) {
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get usernames for demoted participants
        const demotedUsernames = await Promise.all(participants.map(async jid => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]}`;
        }));

        let demotedBy;
        let mentionList = participants.map(jid => {
            return typeof jid === 'string' ? jid : (jid.id || jid.toString());
        });

        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = 'System';
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `╭─❖ *GROUP DEMOTION* ❖─
│
├─ 👤 *Demoted User${participants.length > 1 ? 's' : ''}:*
│  ${demotedUsernames.map(name => `├─ ${name}`).join('\n')}
│
├─ 👑 *Demoted By:* ${demotedBy}
│
├─ 📅 *Date:* ${new Date().toLocaleString()}
│
╰─➤ _Event detected_`;
        
        await client.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList,
            ...channelInfo
        });
        
        console.log(`[DEMOTE EVENT] ${participants.length} user(s) demoted in ${groupId}`);
        
    } catch (error) {
        console.error('Error handling demotion event:', error);
    }
}

module.exports = { demoteCommand, handleDemotionEvent };
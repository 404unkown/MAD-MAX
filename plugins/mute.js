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

async function muteCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if in group
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
                text: '❌ Please make the bot an admin first.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use the mute command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Parse duration from args
        let durationInMinutes;
        if (args && args.length > 0) {
            durationInMinutes = parseInt(args[0]);
            if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
                durationInMinutes = undefined;
            } else if (durationInMinutes > 1440) { // Max 24 hours
                await client.sendMessage(chatId, { 
                    text: '⚠️ Maximum mute duration is 24 hours (1440 minutes).\nMuting for 24 hours instead.',
                    ...channelInfo
                }, { quoted: message });
                durationInMinutes = 1440;
            }
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Mute the group
        await client.groupSettingUpdate(chatId, 'announcement');
        
        if (durationInMinutes !== undefined && durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;
            
            await client.sendMessage(chatId, { 
                text: `╭─❖ *GROUP MUTED* ❖─
│
├─ ✅ Group has been muted for *${durationInMinutes} minute${durationInMinutes > 1 ? 's' : ''}*
│
├─ 🔒 *Only admins can send messages*
│
╰─➤ _Action by: ${pushName}_`,
                ...channelInfo
            }, { quoted: message });
            
            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
            
            // Set timeout to unmute after duration
            setTimeout(async () => {
                try {
                    await client.groupSettingUpdate(chatId, 'not_announcement');
                    await client.sendMessage(chatId, { 
                        text: '🔊 *Group Unmuted*\n\nTimer expired! The group has been automatically unmuted.',
                        ...channelInfo
                    });
                    console.log(`[MUTE] Auto-unmuted ${chatId} after ${durationInMinutes} minutes`);
                } catch (unmuteError) {
                    console.error('Error unmuting group:', unmuteError);
                }
            }, durationInMilliseconds);
            
            console.log(`[MUTE] Group ${chatId} muted for ${durationInMinutes} minutes by ${sender}`);
            
        } else {
            await client.sendMessage(chatId, { 
                text: `╭─❖ *GROUP MUTED* ❖─
│
├─ ✅ Group has been muted indefinitely
│
├─ 🔒 *Only admins can send messages*
│
╰─➤ _Action by: ${pushName}_`,
                ...channelInfo
            }, { quoted: message });
            
            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });
            
            console.log(`[MUTE] Group ${chatId} muted indefinitely by ${sender}`);
        }
        
    } catch (error) {
        console.error('Error muting group:', error);
        
        let errorMessage = '❌ An error occurred while muting the group.';
        if (error.message.includes('not an admin')) {
            errorMessage = '❌ Bot is not an admin or was demoted.';
        } else if (error.message.includes('404')) {
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

module.exports = muteCommand;
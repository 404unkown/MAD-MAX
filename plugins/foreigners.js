const { channelInfo } = require('../lib/messageConfig');

async function foreignersCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: "❌ This command can only be used in groups!",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Check if bot is admin
        const isBotAdmin = participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isBotAdmin) {
            await client.sendMessage(chatId, {
                text: "❌ I need to be an admin to use this command!",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if sender is admin
        const isSenderAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isSenderAdmin && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: "❌ Only group admins can use this command!",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get mycode from config
        const { mycode } = require('../set');
        
        // Filter non-admin members whose numbers don't start with mycode and are not the bot
        let foreigners = participants
            .filter(p => !p.admin) // Filter out admins
            .map(p => p.id) // Get IDs
            .filter(id => !id.startsWith(mycode) && id !== client.decodeJid(client.user.id)); // Filter by country code

        // If no arguments or just checking
        if (!args || !args[0]) {
            if (foreigners.length === 0) {
                await client.sendMessage(chatId, {
                    text: "✅ No foreigners detected in this group.",
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            let messageText = `🌍 *Foreigners Detected*\n\n`;
            messageText += `Foreigners are members whose country code is not *${mycode}*.\n`;
            messageText += `Found *${foreigners.length}* foreigners:\n\n`;
            
            for (let foreigner of foreigners) {
                messageText += `👤 @${foreigner.split('@')[0]}\n`;
            }
            
            messageText += `\n📝 *To remove them, send:* \`.foreigners -x\``;

            await client.sendMessage(chatId, {
                text: messageText,
                mentions: foreigners,
                ...channelInfo
            }, { quoted: message });
            
            return;
        }

        // If -x argument provided, remove foreigners
        if (args[0] === '-x') {
            if (foreigners.length === 0) {
                await client.sendMessage(chatId, {
                    text: "✅ No foreigners to remove.",
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            // Send warning message
            await client.sendMessage(chatId, {
                text: `⚠️ *Removing Foreigners*\n\nI will now remove all *${foreigners.length}* foreigners from this group in 3 seconds...\n\n_This action cannot be undone!_`,
                mentions: foreigners,
                ...channelInfo
            }, { quoted: message });

            // Wait 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Send countdown
            await client.sendMessage(chatId, {
                text: "⏳ 3...",
                ...channelInfo
            }, { quoted: message });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await client.sendMessage(chatId, {
                text: "⏳ 2...",
                ...channelInfo
            }, { quoted: message });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await client.sendMessage(chatId, {
                text: "⏳ 1...",
                ...channelInfo
            }, { quoted: message });
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Remove foreigners
            try {
                await client.groupParticipantsUpdate(chatId, foreigners, "remove");
                
                await client.sendMessage(chatId, {
                    text: `✅ *Success!*\n\nRemoved *${foreigners.length}* foreigners from the group.`,
                    ...channelInfo
                }, { quoted: message });

                // Success reaction
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });

            } catch (removeError) {
                console.error('Remove error:', removeError);
                await client.sendMessage(chatId, {
                    text: `❌ Failed to remove some members. Error: ${removeError.message}`,
                    ...channelInfo
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Foreigners command error:', error);
        
        await client.sendMessage(chatId, {
            text: "❌ An error occurred while executing the command.",
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = foreignersCommand;
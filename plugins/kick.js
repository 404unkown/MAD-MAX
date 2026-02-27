const isAdmin = require('../lib/isAdmin');

async function kickCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Check admin status (skip if bot owner)
        if (!isOwner) {
            const adminStatus = await isAdmin(client, chatId, sender);

            if (!adminStatus.isBotAdmin) {
                await client.sendMessage(chatId, { 
                    text: '❌ Bot needs to be an admin to kick members!',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }

            if (!adminStatus.isSenderAdmin) {
                await client.sendMessage(chatId, { 
                    text: '❌ Only group admins can use the kick command!',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return;
            }
        }

        // Get users to kick
        let usersToKick = [];
        
        // Check for mentioned users
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentionedJids && mentionedJids.length > 0) {
            usersToKick = mentionedJids;
        }
        // Check if replying to a user's message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
        }
        // Check if user provided numbers in args
        else if (args && args.length > 0) {
            // Try to extract numbers from args
            usersToKick = args.map(arg => {
                const num = arg.replace(/[^0-9]/g, '');
                return num ? `${num}@s.whatsapp.net` : null;
            }).filter(jid => jid !== null);
        }
        
        if (usersToKick.length === 0) {
            await client.sendMessage(chatId, { 
                text: '📝 *KICK COMMAND*\n\nUsage: .kick @user or reply to user\'s message\n\nExample: .kick @1234567890',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Get bot info
        const botId = client.user?.id || '';
        const botLid = client.user?.lid || '';
        const botPhoneNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
        const botIdFormatted = botPhoneNumber + '@s.whatsapp.net';
        
        // Extract numeric part from bot LID
        const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);

        // Get group metadata
        const metadata = await client.groupMetadata(chatId);
        const participants = metadata.participants || [];

        // Check if trying to kick bot
        const isTryingToKickBot = usersToKick.some(userId => {
            const userPhoneNumber = userId.includes(':') ? userId.split(':')[0] : (userId.includes('@') ? userId.split('@')[0] : userId);
            const userLidNumeric = userId.includes('@lid') ? userId.split('@')[0].split(':')[0] : '';
            
            // Direct match checks
            const directMatch = (
                userId === botId ||
                userId === botLid ||
                userId === botIdFormatted ||
                userPhoneNumber === botPhoneNumber ||
                (userLidNumeric && botLidNumeric && userLidNumeric === botLidNumeric)
            );
            
            if (directMatch) return true;
            
            // Check against participants
            return participants.some(p => {
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pFullId = p.id || '';
                
                // Extract numeric part from participant LID
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
                
                // Check if this participant is the bot
                const isThisParticipantBot = (
                    pFullId === botId ||
                    pLidNumeric === botLidNumeric ||
                    pPhoneNumber === botPhoneNumber ||
                    pId === botPhoneNumber
                );
                
                if (isThisParticipantBot) {
                    return (
                        userId === pFullId ||
                        userPhoneNumber === pPhoneNumber ||
                        userPhoneNumber === pId ||
                        (pLid && userLidNumeric && userLidNumeric === pLidNumeric)
                    );
                }
                return false;
            });
        });

        if (isTryingToKickBot) {
            await client.sendMessage(chatId, { 
                text: "❌ I can't kick myself! 🤖",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Check if trying to kick owner
        const config = require('../set');
        const ownerNumber = config.owner || '';
        const ownerJid = ownerNumber ? `${ownerNumber}@s.whatsapp.net` : null;
        
        if (ownerJid && usersToKick.includes(ownerJid)) {
            await client.sendMessage(chatId, { 
                text: "❌ You cannot kick the bot owner! 👑",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Kick users
        try {
            await client.groupParticipantsUpdate(chatId, usersToKick, "remove");
            
            const usernames = usersToKick.map(jid => `@${jid.split('@')[0]}`).join(', ');
            
            await client.sendMessage(chatId, { 
                text: `✅ *KICKED SUCCESSFULLY*\n\n${usernames} ${usersToKick.length > 1 ? 'have' : 'has'} been kicked from the group!`,
                mentions: usersToKick,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error in kick command:', error);
            
            let errorMessage = '❌ Failed to kick user(s)!';
            if (error.message.includes('not-authorized')) {
                errorMessage = '❌ Bot lacks permission to kick this user. They might be an admin.';
            } else if (error.message.includes('group-not-found')) {
                errorMessage = '❌ Group not found.';
            }
            
            await client.sendMessage(chatId, { 
                text: errorMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Kick command error:', error);
        await client.sendMessage(chatId, { 
            text: '❌ An error occurred while processing the kick command.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = kickCommand;
const { handleGoodbye } = require('../lib/welcome');
const { isGoodByeOn, getGoodbye } = require('../lib/index');
const fetch = require('node-fetch');

async function goodbyeCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
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

        // Pass the full args to handleGoodbye
        const matchText = args.join(' ');
        await handleGoodbye(client, chatId, message, matchText);
        
    } catch (error) {
        console.error('Error in goodbye command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ *Error processing goodbye command*',
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

async function handleLeaveEvent(client, id, participants) {
    try {
        // Check if goodbye is enabled for this group
        const isGoodbyeEnabled = await isGoodByeOn(id);
        if (!isGoodbyeEnabled) return;

        // Get custom goodbye message
        const customMessage = await getGoodbye(id);

        // Get group metadata
        const groupMetadata = await client.groupMetadata(id);
        const groupName = groupMetadata.subject;

        // Send goodbye message for each leaving participant
        for (const participant of participants) {
            try {
                // Handle participant JID
                const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                const user = participantString.split('@')[0];
                
                // Get user's display name
                let displayName = user;
                try {
                    const contact = await client.getBusinessProfile(participantString);
                    if (contact && contact.name) {
                        displayName = contact.name;
                    } else {
                        const groupParticipants = groupMetadata.participants;
                        const userParticipant = groupParticipants.find(p => p.id === participantString);
                        if (userParticipant && userParticipant.name) {
                            displayName = userParticipant.name;
                        }
                    }
                } catch (nameError) {
                    console.log('Could not fetch display name, using phone number');
                }
                
                // Process custom message with variables
                let finalMessage;
                if (customMessage) {
                    finalMessage = customMessage
                        .replace(/{user}/g, `@${displayName}`)
                        .replace(/{group}/g, groupName);
                } else {
                    finalMessage = `👋 *Goodbye* @${displayName}\n\nWe will miss you in *${groupName}*!`;
                }
                
                // Try to send with image
                try {
                    let profilePicUrl = '';
                    try {
                        const profilePic = await client.profilePictureUrl(participantString, 'image');
                        if (profilePic) {
                            profilePicUrl = profilePic;
                        }
                    } catch (profileError) {
                        console.log('Could not fetch profile picture');
                    }
                    
                    const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming1?type=leave&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}`;
                    
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const imageBuffer = await response.buffer();
                        
                        await client.sendMessage(id, {
                            image: imageBuffer,
                            caption: finalMessage,
                            mentions: [participantString],
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363401269012709@newsletter',
                                    newsletterName: 'MAD-MAX',
                                    serverMessageId: -1
                                }
                            }
                        });
                        continue;
                    }
                } catch (imageError) {
                    console.log('Image generation failed, falling back to text');
                }
                
                // Send text message
                await client.sendMessage(id, {
                    text: finalMessage,
                    mentions: [participantString],
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                });
                
            } catch (error) {
                console.error('Error sending goodbye message:', error);
                const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
                const user = participantString.split('@')[0];
                
                await client.sendMessage(id, {
                    text: `👋 Goodbye @${user}!`,
                    mentions: [participantString],
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error in handleLeaveEvent:', error);
    }
}

module.exports = { 
    goodbyeCommand, 
    handleLeaveEvent 
};
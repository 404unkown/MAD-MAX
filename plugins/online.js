const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

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

async function online(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if the command is used in a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: "❌ This command can only be used in a group!",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if user is either owner or admin
        const senderIsSudo = await isSudo(sender);
        const isCreator = isOwner || senderIsSudo;
        
        // Get admin status
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!isCreator && !adminStatus.isSenderAdmin) {
            await client.sendMessage(chatId, {
                text: "❌ Only bot owner/sudo and group admins can use this command!",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Inform user that we're checking
        const processingMsg = await client.sendMessage(chatId, {
            text: "🔄 *Scanning for online members...*\n\nThis may take 15-20 seconds. Please wait.",
            ...channelInfo
        }, { quoted: message });

        const onlineMembers = new Set();
        
        try {
            // Get group metadata
            const groupData = await client.groupMetadata(chatId);
            
            // Request presence updates for all participants
            const presencePromises = [];
            
            for (const participant of groupData.participants) {
                presencePromises.push(
                    client.presenceSubscribe(participant.id)
                        .then(() => {
                            // Additional check for better detection
                            return client.sendPresenceUpdate('composing', participant.id);
                        })
                        .catch(() => {}) // Ignore errors for individual users
                );
            }

            await Promise.all(presencePromises);

            // Presence update handler
            const presenceHandler = (json) => {
                try {
                    for (const id in json.presences) {
                        const presence = json.presences[id]?.lastKnownPresence;
                        // Check all possible online states
                        if (['available', 'composing', 'recording', 'online'].includes(presence)) {
                            onlineMembers.add(id);
                        }
                    }
                } catch (e) {
                    console.error('Error in presence handler:', e);
                }
            };

            client.ev.on('presence.update', presenceHandler);

            // Multiple checks with timeout
            const checks = 3;
            const checkInterval = 5000; // 5 seconds
            let checksDone = 0;

            const checkOnline = async () => {
                checksDone++;
                
                if (checksDone >= checks) {
                    clearInterval(interval);
                    client.ev.off('presence.update', presenceHandler);
                    
                    // Update processing message
                    await client.sendMessage(chatId, {
                        text: `✅ Scan complete! Found ${onlineMembers.size} online members.`,
                        edit: processingMsg.key
                    });

                    if (onlineMembers.size === 0) {
                        await client.sendMessage(chatId, {
                            text: "⚠️ Couldn't detect any online members. They might be hiding their presence or offline.",
                            ...channelInfo
                        }, { quoted: message });
                        return;
                    }
                    
                    const onlineArray = Array.from(onlineMembers);
                    const onlineList = onlineArray.map((member, index) => 
                        `${index + 1}. @${member.split('@')[0]}`
                    ).join('\n');
                    
                    const messageText = `╭─❖ *ONLINE MEMBERS* ❖─
│
├─ *Online:* ${onlineArray.length}/${groupData.participants.length}
│
${onlineList}
│
╰─➤ _Total members: ${groupData.participants.length}_`;
                    
                    await client.sendMessage(chatId, { 
                        text: messageText,
                        mentions: onlineArray,
                        ...channelInfo
                    }, { quoted: message });
                }
            };

            const interval = setInterval(checkOnline, checkInterval);

            // Safety timeout (30 seconds)
            setTimeout(() => {
                clearInterval(interval);
                client.ev.off('presence.update', presenceHandler);
                
                if (onlineMembers.size === 0) {
                    client.sendMessage(chatId, {
                        text: "⏰ Scan timed out. Try again or members might be offline.",
                        ...channelInfo
                    }, { quoted: message });
                }
            }, 30000);

        } catch (groupError) {
            console.error('Group metadata error:', groupError);
            await client.sendMessage(chatId, {
                text: "❌ Failed to get group information. Make sure I'm a participant in this group.",
                ...channelInfo
            }, { quoted: message });
        }

    } catch (e) {
        console.error("Error in online command:", e);
        await client.sendMessage(chatId, {
            text: `❌ An error occurred: ${e.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    online
};
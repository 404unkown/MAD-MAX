async function staffCommand(client, chatId, message, args, sender, pushName, isOwner) {
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

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        
        // Get group profile picture
        let pp;
        try {
            pp = await client.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        
        // Format admin list
        let listAdmin = '';
        if (groupAdmins.length === 0) {
            listAdmin = 'No admins found';
        } else {
            listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ');
        }
        
        // Get group owner
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create staff text
        const text = `╭─❖ *GROUP STAFF* ❖─
│
├─ *Group:* ${groupMetadata.subject}
│
├─ *Total Members:* ${participants.length}
│
├─ *Admins:* ${groupAdmins.length}
│
├─ *Owner:* @${owner.split('@')[0]}
│
├─ *Admin List:*
▢ ${listAdmin}
│
╰─➤ _Requested by: ${pushName}_`;

        // Prepare mentions
        const mentions = [...groupAdmins.map(v => v.id), owner];
        if (sender) mentions.push(sender);

        // Send the message with image and mentions
        await client.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: mentions,
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
        console.error('Error in staff command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to get admin list!',
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

module.exports = staffCommand;
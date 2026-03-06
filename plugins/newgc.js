const config = require('../set');

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

async function newgcCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if sender is owner
        const isOwner = require('../lib/isOwner');
        const isUserOwner = await isOwner(sender, client, chatId);
        
        if (!isUserOwner && !isOwnerSimple) {
            await client.sendMessage(chatId, {
                text: '❌ Only bot owner can use this command!',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Join all args to get the full command text
        const fullCommand = args.join(' ');
        
        if (!fullCommand.includes(';')) {
            await client.sendMessage(chatId, {
                text: `📝 *CREATE NEW GROUP*\n\n*Usage:* .newgc Group Name;number1,number2,number3\n\n*Example:* .newgc My Friends Group;254769769295,254712345678,254798765432\n\n📌 *Note:* Numbers must be in international format without + or spaces.`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Parse the command
        const [groupName, numbersString] = fullCommand.split(';');
        
        if (!groupName || !groupName.trim()) {
            await client.sendMessage(chatId, {
                text: '❌ Please provide a group name!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (!numbersString || !numbersString.trim()) {
            await client.sendMessage(chatId, {
                text: '❌ Please provide at least one participant number!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Process participant numbers
        const participantNumbers = numbersString
            .split(',')
            .map(num => num.trim().replace(/[^0-9]/g, ''))
            .filter(num => num.length >= 9 && num.length <= 15)
            .map(num => num + '@s.whatsapp.net');

        if (participantNumbers.length === 0) {
            await client.sendMessage(chatId, {
                text: '❌ No valid numbers provided! Numbers must be 9-15 digits.',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Add bot owner to the group automatically
        const config = require('../set');
        const ownerNumber = config.owner + '@s.whatsapp.net';
        if (!participantNumbers.includes(ownerNumber)) {
            participantNumbers.push(ownerNumber);
        }

        // Create the group
        const group = await client.groupCreate(groupName.trim(), participantNumbers);
        
        // Get the invite link
        const inviteCode = await client.groupInviteCode(group.id);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // Send welcome message to the new group
        await client.sendMessage(group.id, {
            text: `👋 *Welcome to ${groupName.trim()}!*\n\nThis group was created by MAD-MAX Bot.\n\n👤 *Created by:* @${sender.split('@')[0]}\n📅 *Date:* ${new Date().toLocaleDateString()}`,
            mentions: participantNumbers,
            ...channelInfo
        });

        // Send success message to the command issuer
        await client.sendMessage(chatId, {
            text: `✅ *GROUP CREATED SUCCESSFULLY!*\n\n📌 *Group Name:* ${groupName.trim()}\n🔗 *Invite Link:* ${inviteLink}\n👥 *Participants:* ${participantNumbers.length}\n\n📝 *Welcome message sent to the new group.*`,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("NewGC Command Error:", error);
        
        let errorMsg = '❌ Failed to create group.';
        
        if (error.message?.includes('closed')) {
            errorMsg = '❌ Cannot create group. WhatsApp might have restrictions.';
        } else if (error.message?.includes('too-long')) {
            errorMsg = '❌ Group name is too long.';
        } else if (error.message?.includes('invalid')) {
            errorMsg = '❌ Invalid numbers provided.';
        }
        
        await client.sendMessage(chatId, {
            text: errorMsg + '\n\n*Error:* ' + error.message,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = newgcCommand;
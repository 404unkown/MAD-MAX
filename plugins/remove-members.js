const config = require('../set');
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

// Sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== REMOVE NON-ADMIN MEMBERS ====================
async function removeMembersCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
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

        // Check if sender is admin using isAdmin library (ONLY admin check)
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

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Get bot owner ID for exclusion (still need to exclude bot itself)
        const botOwner = client.user.id.split(":")[0] + '@s.whatsapp.net';
        
        // Get admin list using isAdmin for each participant (more reliable)
        const adminList = [];
        for (const participant of participants) {
            const adminStatus = await isAdmin(client, chatId, participant.id);
            if (adminStatus.isSenderAdmin) {
                adminList.push(participant.id);
            }
        }
        
        // Filter non-admin participants (excluding bot)
        const nonAdminParticipants = participants.filter(member => 
            !adminList.includes(member.id) && 
            member.id !== client.user.id
        );

        if (nonAdminParticipants.length === 0) {
            await client.sendMessage(chatId, {
                text: 'ℹ️ There are no non-admin members to remove.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎉', key: message.key } 
        });

        await client.sendMessage(chatId, {
            text: `🔄 *Removing ${nonAdminParticipants.length} non-admin members...*\n\nThis may take a few moments.`,
            ...channelInfo
        }, { quoted: message });

        let successCount = 0;
        let failCount = 0;

        for (let participant of nonAdminParticipants) {
            try {
                await client.groupParticipantsUpdate(chatId, [participant.id], "remove");
                successCount++;
                await sleep(2000); // 2-second delay between removals
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
                failCount++;
            }
        }

        await client.sendMessage(chatId, {
            text: `✅ *Removal Complete*\n\n✅ Successfully removed: ${successCount}\n❌ Failed: ${failCount}`,
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Remove Members Command Error:", error);
        await client.sendMessage(chatId, {
            text: '❌ An error occurred while trying to remove members.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// ==================== REMOVE ADMINS ====================
async function removeAdminsCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
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

        // Check if sender is admin using isAdmin library (ONLY admin check)
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

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Get bot owner ID for exclusion
        const botOwner = client.user.id.split(":")[0] + '@s.whatsapp.net';
        
        // Get admin participants using isAdmin (excluding bot)
        const adminParticipants = [];
        for (const participant of participants) {
            if (participant.id === client.user.id) continue; // Skip bot
            
            const adminStatus = await isAdmin(client, chatId, participant.id);
            if (adminStatus.isSenderAdmin) {
                adminParticipants.push(participant);
            }
        }

        if (adminParticipants.length === 0) {
            await client.sendMessage(chatId, {
                text: 'ℹ️ There are no admin members to remove (excluding bot).',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎉', key: message.key } 
        });

        await client.sendMessage(chatId, {
            text: `🔄 *Removing ${adminParticipants.length} admin members...*\n\nThis may take a few moments.`,
            ...channelInfo
        }, { quoted: message });

        let successCount = 0;
        let failCount = 0;

        for (let participant of adminParticipants) {
            try {
                await client.groupParticipantsUpdate(chatId, [participant.id], "remove");
                successCount++;
                await sleep(2000); // 2-second delay between removals
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
                failCount++;
            }
        }

        await client.sendMessage(chatId, {
            text: `✅ *Removal Complete*\n\n✅ Successfully removed: ${successCount}\n❌ Failed: ${failCount}`,
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Remove Admins Command Error:", error);
        await client.sendMessage(chatId, {
            text: '❌ An error occurred while trying to remove admins.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// ==================== REMOVE ALL MEMBERS (EXCLUDING BOT) ====================
async function removeAllCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
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

        // Check if sender is admin using isAdmin library (ONLY admin check)
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

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Filter out bot from the list
        const participantsToRemove = participants.filter(
            participant => participant.id !== client.user.id
        );

        if (participantsToRemove.length === 0) {
            await client.sendMessage(chatId, {
                text: 'ℹ️ No members to remove after excluding the bot.',
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎉', key: message.key } 
        });

        await client.sendMessage(chatId, {
            text: `🔄 *Removing ${participantsToRemove.length} members (admins & non-admins)...*\n\nThis may take a few moments.`,
            ...channelInfo
        }, { quoted: message });

        let successCount = 0;
        let failCount = 0;

        for (let participant of participantsToRemove) {
            try {
                await client.groupParticipantsUpdate(chatId, [participant.id], "remove");
                successCount++;
                await sleep(2000); // 2-second delay between removals
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
                failCount++;
            }
        }

        await client.sendMessage(chatId, {
            text: `✅ *Removal Complete*\n\n✅ Successfully removed: ${successCount}\n❌ Failed: ${failCount}`,
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Remove All Command Error:", error);
        await client.sendMessage(chatId, {
            text: '❌ An error occurred while trying to remove members.',
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = {
    removeMembersCommand,
    removeAdminsCommand,
    removeAllCommand
};
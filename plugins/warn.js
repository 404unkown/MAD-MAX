const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Define paths
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

// Initialize warnings file if it doesn't exist
function initializeWarningsFile() {
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
    if (!fs.existsSync(warningsPath)) {
        fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
    }
}

async function warnCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Initialize files first
        initializeWarningsFile();

        // First check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, { 
                text: 'This command can only be used in groups!'
            }, { quoted: message });
            return;
        }

        // Check admin status
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!adminStatus.isBotAdmin) {
            await client.sendMessage(chatId, { 
                text: '❌ Please make the bot an admin first to use this command.'
            }, { quoted: message });
            return;
        }

        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only group admins can use the warn command.'
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        let userToWarn;
        
        // Check for mentioned users
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentionedJids.length > 0) {
            userToWarn = mentionedJids[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWarn = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToWarn) {
            await client.sendMessage(chatId, { 
                text: '❌ Please mention the user or reply to their message to warn!'
            }, { quoted: message });
            await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return;
        }

        // Read warnings
        let warnings = {};
        try {
            warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        } catch {
            warnings = {};
        }

        // Initialize nested objects
        if (!warnings[chatId]) warnings[chatId] = {};
        if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
        
        warnings[chatId][userToWarn]++;
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

        const warningMessage = `⚠️ *WARNING ALERT*\n\n` +
            `👤 *Warned User:* @${userToWarn.split('@')[0]}\n` +
            `⚠️ *Warning Count:* ${warnings[chatId][userToWarn]}/3\n` +
            `👑 *Warned By:* @${sender.split('@')[0]}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;

        await client.sendMessage(chatId, { 
            text: warningMessage,
            mentions: [userToWarn, sender]
        }, { quoted: message });

        // Auto-kick after 3 warnings
        if (warnings[chatId][userToWarn] >= 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            await client.groupParticipantsUpdate(chatId, [userToWarn], "remove");
            delete warnings[chatId][userToWarn];
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
            
            const kickMessage = `🚫 *AUTO-KICK*\n\n` +
                `@${userToWarn.split('@')[0]} has been removed after receiving 3 warnings! ⚠️`;

            await client.sendMessage(chatId, { 
                text: kickMessage,
                mentions: [userToWarn]
            });
        }

        await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Error in warn command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to warn user.'
        }, { quoted: message });
        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
}

module.exports = warnCommand;
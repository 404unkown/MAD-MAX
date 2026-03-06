const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize warnings file if it doesn't exist
if (!fs.existsSync(warningsFilePath)) {
    fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
}

function loadWarnings() {
    try {
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading warnings:', error);
        return {};
    }
}

async function warningsCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check for mentioned users
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJids.length === 0) {
            await client.sendMessage(chatId, { 
                text: 'Please mention a user to check warnings.\n\nExample: .warnings @user'
            }, { quoted: message });
            return;
        }

        const warnings = loadWarnings();
        const userToCheck = mentionedJids[0];
        const chatWarnings = warnings[chatId] || {};
        const warningCount = chatWarnings[userToCheck] || 0;

        await client.sendMessage(chatId, { 
            text: `⚠️ *Warnings for* @${userToCheck.split('@')[0]}\n\nTotal warnings: ${warningCount}/3`,
            mentions: [userToCheck]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in warnings command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to check warnings.'
        }, { quoted: message });
    }
}

module.exports = warningsCommand;
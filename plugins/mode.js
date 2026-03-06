const fs = require('fs');
const path = require('path');

// Path to mode file
const MODE_PATH = path.join(__dirname, '../data/mode.json');

// Read mode state
function readModeState() {
    try {
        if (!fs.existsSync(MODE_PATH)) {
            return { isPublic: true };
        }
        const data = JSON.parse(fs.readFileSync(MODE_PATH, 'utf8'));
        return { isPublic: data.isPublic !== false };
    } catch {
        return { isPublic: true };
    }
}

// Write mode state
function writeModeState(isPublic) {
    try {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(MODE_PATH, JSON.stringify({ isPublic: !!isPublic }, null, 2));
    } catch (error) {
        console.error('Error saving mode state:', error);
    }
}

// Mode command handler
async function modeCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if user is owner
        if (!isOwner) {
            await client.sendMessage(chatId, {
                text: '❌ Only the bot owner can use this command!'
            }, { quoted: message });
            return;
        }

        const currentMode = readModeState();
        const action = args[0]?.toLowerCase();

        if (!action || action === 'status') {
            const status = currentMode.isPublic ? '✅ PUBLIC' : '🔒 PRIVATE';
            await client.sendMessage(chatId, {
                text: `📊 *BOT MODE*\n\nCurrent mode: ${status}\n\n*Usage:*\n• .mode public - Everyone can use bot\n• .mode private - Only owner can use bot`
            }, { quoted: message });
            return;
        }

        if (action === 'public') {
            if (currentMode.isPublic) {
                await client.sendMessage(chatId, {
                    text: '⚠️ Bot is already in PUBLIC mode'
                }, { quoted: message });
                return;
            }
            writeModeState(true);
            await client.sendMessage(chatId, {
                text: '✅ *Bot mode changed to PUBLIC*\n\nEveryone can now use the bot commands.'
            }, { quoted: message });
        }
        else if (action === 'private') {
            if (!currentMode.isPublic) {
                await client.sendMessage(chatId, {
                    text: '⚠️ Bot is already in PRIVATE mode'
                }, { quoted: message });
                return;
            }
            writeModeState(false);
            await client.sendMessage(chatId, {
                text: '🔒 *Bot mode changed to PRIVATE*\n\nOnly the owner can now use bot commands.'
            }, { quoted: message });
        }
        else {
            await client.sendMessage(chatId, {
                text: '❌ Invalid option!\n\nUse: .mode public or .mode private'
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in mode command:', error);
        await client.sendMessage(chatId, {
            text: '❌ Failed to change bot mode.'
        }, { quoted: message });
    }
}

module.exports = { 
    modeCommand, 
    readModeState, 
    writeModeState 
};
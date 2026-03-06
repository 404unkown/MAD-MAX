const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// State file path
const autostatusPath = path.join(__dirname, '..', 'data', 'autostatus.json');

// Default state
const defaultState = {
    enabled: false,
    reactEnabled: false,
    reactEmoji: '💚', // Default heart
    blacklist: []
};

// List of valid WhatsApp reaction emojis
const VALID_REACTION_EMOJIS = [
    '👍', '👎', '❤️', '🔥', '🥰', '👏', '😁', '🤔', '🤯', '😱', 
    '🤬', '😢', '🎉', '🤩', '🤮', '💩', '🙏', '👌', '🕊️', '🤡',
    '🥱', '🥴', '😍', '🐳', '❤‍🔥', '🌚', '🌭', '💯', '🤣', 
    '⚡', '🍌', '🏆', '💔', '🤨', '😐', '🍓', '🍾', '💋', '🖕',
    '😈', '😴', '😭', '🤓', '👻', '👨‍💻', '👀', '🎃', '🙈', '😇',
    '😨', '🤝', '✍️', '🤗', '🫡', '🎅', '🎄', '☃️', '💅', '🤪',
    '🗿', '🆒', '💘', '🙉', '🦄', '😘', '💊', '🙊', '😎', '👾',
    '🤷‍♂️', '🤷', '🤷‍♀️', '😡'
];

// Read autostatus state
function readAutoStatusState() {
    try {
        if (!fs.existsSync(autostatusPath)) {
            return defaultState;
        }
        return JSON.parse(fs.readFileSync(autostatusPath, 'utf8'));
    } catch (error) {
        console.error('Error reading autostatus state:', error);
        return defaultState;
    }
}

// Write autostatus state
function writeAutoStatusState(state) {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(autostatusPath, JSON.stringify(state, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving autostatus state:', error);
        return false;
    }
}

// Validate if emoji is supported by WhatsApp reactions
function isValidReactionEmoji(emoji) {
    return VALID_REACTION_EMOJIS.includes(emoji);
}

// Main autostatus command handler
async function autostatusCommand(client, chatId, m, args, sender, pushName, isOwner) {
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only the owner can use this command!' 
        }, { quoted: m });
        return;
    }

    const currentState = readAutoStatusState();
    let newState = { ...currentState };
    let response = '';

    if (args.length === 0) {
        response = `📊 *AUTOSTATUS SETTINGS*\n\n` +
                  `┌─⊷ *STATUS*\n` +
                  `│ 📍 Auto View: ${currentState.enabled ? '✅ *ON*' : '❌ *OFF*'}\n` +
                  `│ 📍 Auto React: ${currentState.reactEnabled ? '✅ *ON*' : '❌ *OFF*'}\n` +
                  `│ 📍 React Emoji: ${currentState.reactEmoji}\n` +
                  `│ 📍 Blacklist: ${currentState.blacklist.length} contacts\n` +
                  `└──────────────\n\n` +
                  `┌─⊷ *COMMANDS*\n` +
                  `│ • .autostatus on - View only\n` +
                  `│ • .autostatus off - Disable all\n` +
                  `│ • .autostatus react on - View + React\n` +
                  `│ • .autostatus react off - View only\n` +
                  `│ • .setemoji [emoji] - Set reaction emoji\n` +
                  `│ • .statusbl add [number] - Blacklist number\n` +
                  `│ • .statusbl remove [number]\n` +
                  `│ • .statusbl list\n` +
                  `└──────────────`;
    } 
    else if (args[0] === 'on') {
        newState.enabled = true;
        newState.reactEnabled = false;
        if (writeAutoStatusState(newState)) {
            response = '✅ *AutoStatus Enabled (View Only)*\n\nI will now automatically view status updates immediately.';
        }
    }
    else if (args[0] === 'off') {
        newState.enabled = false;
        newState.reactEnabled = false;
        if (writeAutoStatusState(newState)) {
            response = '❌ *AutoStatus Disabled*\n\nI will no longer automatically view or react to status updates.';
        }
    }
    else if (args[0] === 'react') {
        if (args[1] === 'on') {
            newState.enabled = true;
            newState.reactEnabled = true;
            if (writeAutoStatusState(newState)) {
                response = '✅ *AutoStatus + Auto React Enabled*\n\nI will now automatically view AND react to status updates immediately!';
            }
        }
        else if (args[1] === 'off') {
            newState.reactEnabled = false;
            if (writeAutoStatusState(newState)) {
                response = '❌ *Auto React Disabled*\n\nI will still view statuses, but no longer react to them.';
            }
        }
    }

    if (response) {
        await client.sendMessage(chatId, { text: response }, { quoted: m });
    }
}

// Auto-react command handler
async function autostatusreactCommand(client, chatId, m, args, sender, pushName, isOwner) {
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only the owner can use this command!' 
        }, { quoted: m });
        return;
    }

    const currentState = readAutoStatusState();
    let newState = { ...currentState };
    let response = '';

    if (args.length === 0) {
        response = `📊 *AUTO REACT STATUS*\n\n` +
                  `Enabled: ${currentState.reactEnabled ? '✅' : '❌'}\n` +
                  `Emoji: ${currentState.reactEmoji}\n\n` +
                  `Commands:\n` +
                  `• .autostatusreact on\n` +
                  `• .autostatusreact off\n` +
                  `• .setemoji [emoji]`;
    }
    else if (args[0] === 'on') {
        newState.reactEnabled = true;
        newState.enabled = true;
        if (writeAutoStatusState(newState)) {
            response = '✅ *Auto React Enabled*\n\nAutoStatus has been enabled automatically.';
        }
    }
    else if (args[0] === 'off') {
        newState.reactEnabled = false;
        if (writeAutoStatusState(newState)) {
            response = '❌ *Auto React Disabled*';
        }
    }

    if (response) {
        await client.sendMessage(chatId, { text: response }, { quoted: m });
    }
}

// Set emoji command handler with validation
async function setemojiCommand(client, chatId, m, args, sender, pushName, isOwner) {
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only the owner can use this command!' 
        }, { quoted: m });
        return;
    }

    if (!args[0]) {
        // Show list of valid emojis
        const emojiList = VALID_REACTION_EMOJIS.slice(0, 20).join(' ');
        await client.sendMessage(chatId, { 
            text: `❌ Please provide an emoji!\n\n*Example:* .setemoji 💚\n\n*Valid emojis (first 20):*\n${emojiList}\n\nUse any emoji from this list for reactions.` 
        }, { quoted: m });
        return;
    }

    const emoji = args[0];
    
    // Validate emoji
    if (!isValidReactionEmoji(emoji)) {
        await client.sendMessage(chatId, { 
            text: `❌ Invalid emoji! "${emoji}" is not supported by WhatsApp reactions.\n\nPlease use a valid emoji from the list.\n\n*Tip:* Try .setemoji 💚 or .setemoji 👍` 
        }, { quoted: m });
        return;
    }

    const currentState = readAutoStatusState();
    currentState.reactEmoji = emoji;
    
    if (writeAutoStatusState(currentState)) {
        await client.sendMessage(chatId, { 
            text: `✅ *React Emoji Updated*\n\nNew emoji: ${emoji}` 
        }, { quoted: m });
    }
}

// Status blacklist command handler
async function statusblCommand(client, chatId, m, args, sender, pushName, isOwner) {
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only the owner can use this command!' 
        }, { quoted: m });
        return;
    }

    const currentState = readAutoStatusState();
    let response = '';

    if (args.length === 0 || args[0] === 'list') {
        if (currentState.blacklist.length === 0) {
            response = '📋 *Blacklist is empty*';
        } else {
            response = '📋 *Blacklisted Numbers*\n\n' + 
                      currentState.blacklist.map((num, i) => `${i+1}. ${num}`).join('\n');
        }
    }
    else if (args[0] === 'add' && args[1]) {
        let number = args[1].replace(/[^0-9]/g, '');
        if (!currentState.blacklist.includes(number)) {
            currentState.blacklist.push(number);
            if (writeAutoStatusState(currentState)) {
                response = `✅ Added ${number} to blacklist`;
            }
        } else {
            response = `❌ ${number} is already in blacklist`;
        }
    }
    else if (args[0] === 'remove' && args[1]) {
        let number = args[1].replace(/[^0-9]/g, '');
        const index = currentState.blacklist.indexOf(number);
        if (index > -1) {
            currentState.blacklist.splice(index, 1);
            if (writeAutoStatusState(currentState)) {
                response = `✅ Removed ${number} from blacklist`;
            }
        } else {
            response = `❌ ${number} not found in blacklist`;
        }
    }

    if (response) {
        await client.sendMessage(chatId, { text: response }, { quoted: m });
    }
}

// ============ FIXED INSTANT AUTOSTATUS HANDLER (NO EMOJIS IN CONSOLE) ============
async function handleAutoStatus(client, msg) {
    try {
        const state = readAutoStatusState();
        
        // Skip if autostatus is disabled
        if (!state.enabled) {
            console.log(chalk.yellow('[AUTO] AutoStatus is disabled'));
            return;
        }
        
        // Get sender info
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderNumber = senderJid.split('@')[0];
        
        // Skip if sender is in blacklist
        if (state.blacklist && state.blacklist.includes(senderNumber)) {
            console.log(chalk.yellow(`[AUTO] Skipping blacklisted contact: ${senderNumber}`));
            return;
        }
        
        // Skip if it's from self
        if (senderJid === client.user.id) return;
        
        console.log(chalk.cyan(`[AUTO] Processing status from ${senderNumber}`));
        
        // VIEW IMMEDIATELY - NO DELAY
        try {
            await client.readMessages([msg.key]);
            console.log(chalk.green(`[SUCCESS] Viewed status from ${senderNumber}`));
        } catch (viewError) {
            console.log(chalk.yellow(`[WARNING] Failed to view: ${viewError.message}`));
        }
        
        // REACT IMMEDIATELY if enabled - NO DELAY
        if (state.reactEnabled && msg.message) {
            try {
                // Wait just 100ms to ensure view went through
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Validate emoji before sending
                let emojiToUse = state.reactEmoji;
                if (!isValidReactionEmoji(emojiToUse)) {
                    console.log(chalk.yellow(`[WARNING] Invalid emoji detected (${emojiToUse}), using default heart`));
                    emojiToUse = '💚';
                }
                
                await client.sendMessage(senderJid, {
                    react: {
                        text: emojiToUse,
                        key: msg.key
                    }
                });
                console.log(chalk.green(`[SUCCESS] Reacted to ${senderNumber}'s status`));
                
            } catch (reactError) {
                console.log(chalk.yellow(`[WARNING] Failed to react: ${reactError.message}`));
            }
        }
        
    } catch (e) {
        console.error(chalk.red('[ERROR] AutoStatus handler error:'), e.message);
    }
}

module.exports = {
    autostatusCommand,
    autostatusreactCommand,
    setemojiCommand,
    statusblCommand,
    handleAutoStatus,
    readAutoStatusState,
    writeAutoStatusState,
    VALID_REACTION_EMOJIS
};
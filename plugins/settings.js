const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const txt = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

// Global channel info (to match your main.js)
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

async function settingsCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const senderId = sender;
        const isGroup = chatId.endsWith('@g.us');
        const dataDir = path.join(__dirname, '../data');

        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Read all settings files
        const mode = readJsonSafe(path.join(dataDir, 'mode.json'), { isPublic: true });
        const autoStatus = readJsonSafe(path.join(dataDir, 'autoStatus.json'), { enabled: false, reactOn: false });
        const autoread = readJsonSafe(path.join(dataDir, 'autoread.json'), { enabled: false });
        const autotyping = readJsonSafe(path.join(dataDir, 'autotyping.json'), { enabled: false });
        const dmblocker = readJsonSafe(path.join(dataDir, 'dmblocker.json'), { enabled: false });
        const anticall = readJsonSafe(path.join(dataDir, 'anticall.json'), { enabled: false });
        const antispam = readJsonSafe(path.join(dataDir, 'antispam.json'), { enabled: true });
        const autosticker = readJsonSafe(path.join(dataDir, 'autosticker.json'), { enabled: false });
        const autoreply = readJsonSafe(path.join(dataDir, 'autoreply.json'), { enabled: false, message: '' });
        const autovoice = readJsonSafe(path.join(dataDir, 'autovoice.json'), { enabled: false });
        const autotext = readJsonSafe(path.join(dataDir, 'autotext.json'), { enabled: false, text: '' });
        const autorecording = readJsonSafe(path.join(dataDir, 'autorecording.json'), { enabled: false });
        
        // Group-specific settings
        const antilink = readJsonSafe(path.join(dataDir, 'antilink.json'), {});
        const antibadword = readJsonSafe(path.join(dataDir, 'antibadword.json'), {});
        const antitag = readJsonSafe(path.join(dataDir, 'antitag.json'), {});
        const welcome = readJsonSafe(path.join(dataDir, 'welcome.json'), {});
        const goodbye = readJsonSafe(path.join(dataDir, 'goodbye.json'), {});
        const chatbot = readJsonSafe(path.join(dataDir, 'chatbot.json'), {});

        const lines = [];
        lines.push('╭───◇ *MAD-MAX SETTINGS* ◇───╮');
        lines.push('');
        lines.push(`▪ *Mode:* ${mode.isPublic ? '🔓 PUBLIC' : '🔒 PRIVATE'}`);
        lines.push(`▪ *Auto Status:* ${autoStatus.enabled ? '✅ ON' : '❌ OFF'} ${autoStatus.reactOn ? '(React: ✅)' : '(React: ❌)'}`);
        lines.push(`▪ *Auto Read:* ${autoread.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Auto Typing:* ${autotyping.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *DM Blocker:* ${dmblocker.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Anti Call:* ${anticall.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Anti Spam:* ${antispam.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Auto Sticker:* ${autosticker.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Auto Reply:* ${autoreply.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Auto Voice:* ${autovoice.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Auto Text:* ${autotext.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`▪ *Auto Recording:* ${autorecording.enabled ? '✅ ON' : '❌ OFF'}`);

        if (isGroup) {
            lines.push('');
            lines.push('╭───◇ *GROUP SETTINGS* ◇───╮');
            lines.push('');
            
            // Antilink
            const groupAntilink = antilink[chatId];
            if (groupAntilink && groupAntilink.enabled) {
                lines.push(`▪ *Anti Link:* ✅ ON (Action: ${groupAntilink.action || 'delete'})`);
            } else {
                lines.push(`▪ *Anti Link:* ❌ OFF`);
            }
            
            // Antibadword
            const groupAntibadword = antibadword[chatId];
            if (groupAntibadword && groupAntibadword.enabled) {
                lines.push(`▪ *Anti Badword:* ✅ ON`);
            } else {
                lines.push(`▪ *Anti Badword:* ❌ OFF`);
            }
            
            // Antitag
            const groupAntitag = antitag[chatId];
            if (groupAntitag && groupAntitag.enabled) {
                lines.push(`▪ *Anti Tag:* ✅ ON`);
            } else {
                lines.push(`▪ *Anti Tag:* ❌ OFF`);
            }
            
            // Welcome
            const groupWelcome = welcome[chatId];
            if (groupWelcome && groupWelcome.enabled) {
                lines.push(`▪ *Welcome:* ✅ ON`);
            } else {
                lines.push(`▪ *Welcome:* ❌ OFF`);
            }
            
            // Goodbye
            const groupGoodbye = goodbye[chatId];
            if (groupGoodbye && groupGoodbye.enabled) {
                lines.push(`▪ *Goodbye:* ✅ ON`);
            } else {
                lines.push(`▪ *Goodbye:* ❌ OFF`);
            }
            
            // Chatbot
            const groupChatbot = chatbot[chatId];
            if (groupChatbot && groupChatbot.enabled) {
                lines.push(`▪ *Chatbot:* ✅ ON`);
            } else {
                lines.push(`▪ *Chatbot:* ❌ OFF`);
            }
        }

        lines.push('');
        lines.push('╰──────◇');
        lines.push('');
        lines.push(`📊 *Total Features:* 15+`);
        lines.push(`👤 *Requested by:* @${senderId.split('@')[0]}`);

        await client.sendMessage(chatId, {
            text: lines.join('\n'),
            mentions: [senderId],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in settings command:', error);
        await client.sendMessage(chatId, {
            text: '❌ Failed to read settings.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = settingsCommand;
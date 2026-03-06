const fs = require('fs');
const path = require('path');

const ONLINEPRIVACY_PATH = path.join(__dirname, '..', 'data', 'onlineprivacy.json');

if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
}

function readState() {
    try {
        if (!fs.existsSync(ONLINEPRIVACY_PATH)) return { enabled: false, setting: 'all' };
        return JSON.parse(fs.readFileSync(ONLINEPRIVACY_PATH, 'utf8') || '{}');
    } catch {
        return { enabled: false, setting: 'all' };
    }
}

function writeState(data) {
    try {
        fs.writeFileSync(ONLINEPRIVACY_PATH, JSON.stringify(data, null, 2));
    } catch {}
}

async function onlineprivacyCommand(client, chatId, m, args, sender, pushName, isOwner) {
    if (!isOwner) {
        return await client.sendMessage(chatId, { text: '❌ Owner only' }, { quoted: m });
    }
    
    const sub = args[0]?.toLowerCase();
    const state = readState();

    if (!sub || !['on', 'off', 'status', 'all', 'match_last_seen'].includes(sub)) {
        return await client.sendMessage(chatId, { 
            text: '*ONLINE PRIVACY*\n\n.on\n.off\n.status\n.all\n.match_last_seen' 
        }, { quoted: m });
    }

    if (sub === 'status') {
        return await client.sendMessage(chatId, { 
            text: `*ONLINE PRIVACY*\nEnabled: ${state.enabled ? '✅' : '❌'}\nSetting: ${state.setting}` 
        }, { quoted: m });
    }

    if (sub === 'on') {
        state.enabled = true;
        writeState(state);
        await client.updateOnlinePrivacy(state.setting);
        return await client.sendMessage(chatId, { text: `✅ Online privacy: ${state.setting}` }, { quoted: m });
    }

    if (sub === 'off') {
        state.enabled = false;
        writeState(state);
        return await client.sendMessage(chatId, { text: '❌ Online privacy disabled' }, { quoted: m });
    }

    state.setting = sub;
    writeState(state);
    if (state.enabled) await client.updateOnlinePrivacy(sub);
    await client.sendMessage(chatId, { text: `✅ Online privacy set to: ${sub}` }, { quoted: m });
}

module.exports = { onlineprivacyCommand };
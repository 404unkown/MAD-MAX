const fs = require('fs');
const path = require('path');

const LASTSEEN_PATH = path.join(__dirname, '..', 'data', 'lastseen.json');

if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
}

function readState() {
    try {
        if (!fs.existsSync(LASTSEEN_PATH)) return { enabled: false, setting: 'all' };
        return JSON.parse(fs.readFileSync(LASTSEEN_PATH, 'utf8') || '{}');
    } catch {
        return { enabled: false, setting: 'all' };
    }
}

function writeState(data) {
    try {
        fs.writeFileSync(LASTSEEN_PATH, JSON.stringify(data, null, 2));
    } catch {}
}

async function lastseenCommand(client, chatId, m, args, sender, pushName, isOwner) {
    if (!isOwner) {
        return await client.sendMessage(chatId, { text: '❌ Owner only' }, { quoted: m });
    }
    
    const sub = args[0]?.toLowerCase();
    const state = readState();

    if (!sub || !['on', 'off', 'status', 'all', 'contacts', 'contact_blacklist', 'none'].includes(sub)) {
        return await client.sendMessage(chatId, { 
            text: '*LAST SEEN PRIVACY*\n\n.on\n.off\n.status\n.all\n.contacts\n.contact_blacklist\n.none' 
        }, { quoted: m });
    }

    if (sub === 'status') {
        return await client.sendMessage(chatId, { 
            text: `*LAST SEEN*\nEnabled: ${state.enabled ? '✅' : '❌'}\nSetting: ${state.setting}` 
        }, { quoted: m });
    }

    if (sub === 'on') {
        state.enabled = true;
        writeState(state);
        await client.updateLastSeenPrivacy(state.setting);
        return await client.sendMessage(chatId, { text: `✅ Last seen: ${state.setting}` }, { quoted: m });
    }

    if (sub === 'off') {
        state.enabled = false;
        writeState(state);
        return await client.sendMessage(chatId, { text: '❌ Last seen disabled' }, { quoted: m });
    }

    state.setting = sub;
    writeState(state);
    if (state.enabled) await client.updateLastSeenPrivacy(sub);
    await client.sendMessage(chatId, { text: `✅ Last seen set to: ${sub}` }, { quoted: m });
}

module.exports = { lastseenCommand };
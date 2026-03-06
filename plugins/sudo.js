const settings = require('../set');
const { addSudo, removeSudo, getSudoList } = require('../lib/index');
const isOwnerOrSudo = require('../lib/isOwner');

function extractMentionedJid(message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return mentioned[0];
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const match = text.match(/\b(\d{7,15})\b/);
    if (match) return match[1] + '@s.whatsapp.net';
    return null;
}

async function sudoCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const senderJid = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderJid, client, chatId);

        const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const argsList = rawText.trim().split(' ').slice(1);
        const sub = (argsList[0] || '').toLowerCase();

        if (!sub || !['add', 'del', 'remove', 'list'].includes(sub)) {
            await client.sendMessage(chatId, { 
                text: '👑 *SUDO COMMANDS*\n\n.sudo add @user - Add sudo user\n.sudo del @user - Remove sudo user\n.sudo list - List all sudo users' 
            }, { quoted: message });
            return;
        }

        if (sub === 'list') {
            const list = await getSudoList();
            if (list.length === 0) {
                await client.sendMessage(chatId, { 
                    text: '📋 No sudo users set.' 
                }, { quoted: message });
                return;
            }
            const text = list.map((j, i) => `${i + 1}. ${j}`).join('\n');
            await client.sendMessage(chatId, { 
                text: `👑 *SUDO USERS*\n\n${text}` 
            }, { quoted: message });
            return;
        }

        if (!isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ Only owner can add/remove sudo users. Use .sudo list to view.' 
            }, { quoted: message });
            return;
        }

        const targetJid = extractMentionedJid(message);
        if (!targetJid) {
            await client.sendMessage(chatId, { 
                text: '❌ Please mention a user or provide a number.' 
            }, { quoted: message });
            return;
        }

        if (sub === 'add') {
            const ok = await addSudo(targetJid);
            await client.sendMessage(chatId, { 
                text: ok ? `✅ Added sudo: ${targetJid}` : '❌ Failed to add sudo' 
            }, { quoted: message });
            return;
        }

        if (sub === 'del' || sub === 'remove') {
            const ownerJid = settings.owner + '@s.whatsapp.net';
            if (targetJid === ownerJid) {
                await client.sendMessage(chatId, { 
                    text: '❌ Owner cannot be removed.' 
                }, { quoted: message });
                return;
            }
            const ok = await removeSudo(targetJid);
            await client.sendMessage(chatId, { 
                text: ok ? `✅ Removed sudo: ${targetJid}` : '❌ Failed to remove sudo' 
            }, { quoted: message });
            return;
        }

    } catch (error) {
        console.error('Error in sudo command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Error processing command.' 
        }, { quoted: message });
    }
}

module.exports = sudoCommand;
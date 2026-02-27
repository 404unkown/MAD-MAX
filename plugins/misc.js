const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(client, message, sender) {
    try {
        // 1) Quoted image (highest priority)
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        // 2) Image in the current message
        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        // 3) Mentioned or replied participant avatar
        let targetJid;
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        if (ctx?.mentionedJid?.length > 0) {
            targetJid = ctx.mentionedJid[0];
        } else if (ctx?.participant) {
            targetJid = ctx.participant;
        } else {
            targetJid = sender;
        }

        try {
            const url = await client.profilePictureUrl(targetJid, 'image');
            return url;
        } catch {
            return 'https://i.imgur.com/2wzGhpF.png';
        }
    } catch (error) {
        console.error('Error getting image URL:', error);
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

async function handleHeart(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '❤️', key: message.key } 
        });

        const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
        const url = `https://api.some-random-api.com/canvas/misc/heart?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        await client.sendMessage(chatId, { 
            image: Buffer.from(response.data),
            caption: `❤️ *Heart Effect*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in misc heart:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to create heart image. Try again later.' 
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

async function simpleAvatarOnly(client, chatId, message, sender, endpoint) {
    const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
    const url = `https://api.some-random-api.com/canvas/misc/${endpoint}?avatar=${encodeURIComponent(avatarUrl)}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    await client.sendMessage(chatId, { 
        image: Buffer.from(response.data),
        caption: `✨ *${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} Effect*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
        mentions: [sender]
    }, { quoted: message });
}

async function miscCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1);

    try {
        if (!sub) {
            await client.sendMessage(chatId, { 
                text: `🎨 *Misc Canvas Commands*\n\n*Usage:* .misc <subcommand> [parameters]\n\n*Available Subcommands:*\n\n❤️ *Basic Effects:*\n• heart\n• horny\n• circle\n• lgbt\n• lied\n• lolice\n• simpcard\n• tonikawa\n\n🖼️ *Overlay Effects:*\n• comrade\n• gay\n• glass\n• jail\n• passed\n• triggered\n\n📝 *Text-based:*\n• its-so-stupid <text>\n• namecard username|birthday|description(optional)\n• oogway <quote>\n• oogway2 <quote>\n\n🐦 *Social Media:*\n• tweet displayname|username|comment|theme(light/dark)\n• youtube-comment username|comment\n\n*Examples:*\n.misc heart\n.misc its-so-stupid very dumb\n.misc namecard John|01-01-2000|Hello world`
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎨', key: message.key } 
        });

        switch (sub) {
            case 'heart':
            case 'horny':
            case 'circle':
            case 'lgbt':
            case 'lied':
            case 'lolice':
            case 'simpcard':
            case 'tonikawa':
                await simpleAvatarOnly(client, chatId, message, sender, sub);
                break;
            
            case 'its-so-stupid': {
                const dog = rest.join(' ').trim();
                if (!dog) {
                    await client.sendMessage(chatId, { text: 'Usage: .misc its-so-stupid <text>' }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
                const url = `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(dog)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await client.sendMessage(chatId, { 
                    image: Buffer.from(response.data),
                    caption: `✨ *Its So Stupid*\n\n📝 *Text:* ${dog}\n👤 *Requested by:* @${sender.split('@')[0]}`,
                    mentions: [sender]
                }, { quoted: message });
                break;
            }

            case 'namecard': {
                const joined = rest.join(' ');
                const [username, birthday, description] = joined.split('|').map(s => (s || '').trim());
                if (!username || !birthday) {
                    await client.sendMessage(chatId, { text: 'Usage: .misc namecard username|birthday|description(optional)' }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
                const params = new URLSearchParams({ username, birthday, avatar: avatarUrl });
                if (description) params.append('description', description);
                const url = `https://api.some-random-api.com/canvas/misc/namecard?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await client.sendMessage(chatId, { 
                    image: Buffer.from(response.data),
                    caption: `✨ *Namecard*\n\n👤 *Username:* ${username}\n🎂 *Birthday:* ${birthday}\n👤 *Requested by:* @${sender.split('@')[0]}`,
                    mentions: [sender]
                }, { quoted: message });
                break;
            }

            case 'oogway':
            case 'oogway2': {
                const quote = rest.join(' ').trim();
                if (!quote) {
                    await client.sendMessage(chatId, { text: `Usage: .misc ${sub} <quote>` }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
                const url = `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(quote)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await client.sendMessage(chatId, { 
                    image: Buffer.from(response.data),
                    caption: `✨ *${sub === 'oogway' ? 'Oogway' : 'Oogway 2'} Quote*\n\n📝 *Quote:* ${quote}\n👤 *Requested by:* @${sender.split('@')[0]}`,
                    mentions: [sender]
                }, { quoted: message });
                break;
            }

            case 'tweet': {
                const joined = rest.join(' ');
                const [displayname, username, comment, theme] = joined.split('|').map(s => (s || '').trim());
                if (!displayname || !username || !comment) {
                    await client.sendMessage(chatId, { text: 'Usage: .misc tweet displayname|username|comment|theme(optional light/dark)' }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
                const params = new URLSearchParams({ displayname, username, comment, avatar: avatarUrl });
                if (theme) params.append('theme', theme);
                const url = `https://api.some-random-api.com/canvas/misc/tweet?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await client.sendMessage(chatId, { 
                    image: Buffer.from(response.data),
                    caption: `✨ *Tweet Generator*\n\n👤 *Display Name:* ${displayname}\n🐦 *Username:* @${username}\n💬 *Comment:* ${comment}\n👤 *Requested by:* @${sender.split('@')[0]}`,
                    mentions: [sender]
                }, { quoted: message });
                break;
            }

            case 'youtube-comment': {
                const joined = rest.join(' ');
                const [username, comment] = joined.split('|').map(s => (s || '').trim());
                if (!username || !comment) {
                    await client.sendMessage(chatId, { text: 'Usage: .misc youtube-comment username|comment' }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
                const params = new URLSearchParams({ username, comment, avatar: avatarUrl });
                const url = `https://api.some-random-api.com/canvas/misc/youtube-comment?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await client.sendMessage(chatId, { 
                    image: Buffer.from(response.data),
                    caption: `✨ *YouTube Comment*\n\n👤 *Username:* ${username}\n💬 *Comment:* ${comment}\n👤 *Requested by:* @${sender.split('@')[0]}`,
                    mentions: [sender]
                }, { quoted: message });
                break;
            }

            // Overlay endpoints
            case 'comrade':
            case 'gay':
            case 'glass':
            case 'jail':
            case 'passed':
            case 'triggered': {
                const avatarUrl = await getQuotedOrOwnImageUrl(client, message, sender);
                const overlay = sub;
                const url = `https://api.some-random-api.com/canvas/overlay/${overlay}?avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await client.sendMessage(chatId, { 
                    image: Buffer.from(response.data),
                    caption: `✨ *${overlay.charAt(0).toUpperCase() + overlay.slice(1)} Overlay*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
                    mentions: [sender]
                }, { quoted: message });
                break;
            }

            default:
                await client.sendMessage(chatId, { 
                    text: '❌ Invalid subcommand. Use `.misc` to see available commands.' 
                }, { quoted: message });
                break;
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error in misc command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to generate image. Check your parameters and try again.' 
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = { miscCommand, handleHeart };
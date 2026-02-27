const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isAdmin = require('../lib/isAdmin');

async function ensureGroupAndAdmin(client, chatId, sender, isOwner) {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) {
        await client.sendMessage(chatId, { 
            text: '❌ This command can only be used in groups!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        });
        return { ok: false };
    }
    
    // Check admin status of sender and bot
    const adminStatus = await isAdmin(client, chatId, sender);
    
    if (!adminStatus.isBotAdmin) {
        await client.sendMessage(chatId, { 
            text: '❌ Bot needs to be an admin to use this command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        });
        return { ok: false };
    }
    
    if (!adminStatus.isSenderAdmin && !isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only group admins can use this command!',
            mentions: [sender],
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        });
        return { ok: false };
    }
    
    return { ok: true };
}

async function setGroupDescription(client, chatId, message, args, sender, pushName, isOwner) {
    const check = await ensureGroupAndAdmin(client, chatId, sender, isOwner);
    if (!check.ok) return;
    
    const desc = args.join(' ').trim();
    if (!desc) {
        await client.sendMessage(chatId, { 
            text: '📝 *SET GROUP DESCRIPTION*\n\nUsage: .setgdesc <description>\n\nExample: .setgdesc Welcome to our group!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }
    
    try {
        await client.groupUpdateDescription(chatId, desc);
        await client.sendMessage(chatId, { 
            text: '✅ *Group description updated successfully!*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (e) {
        console.error('Error updating group description:', e);
        await client.sendMessage(chatId, { 
            text: '❌ *Failed to update group description.*\n\nMake sure the bot is admin and try again.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

async function setGroupName(client, chatId, message, args, sender, pushName, isOwner) {
    const check = await ensureGroupAndAdmin(client, chatId, sender, isOwner);
    if (!check.ok) return;
    
    const name = args.join(' ').trim();
    if (!name) {
        await client.sendMessage(chatId, { 
            text: '📝 *SET GROUP NAME*\n\nUsage: .setgname <new name>\n\nExample: .setgname MAD-MAX Family',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }
    
    try {
        await client.groupUpdateSubject(chatId, name);
        await client.sendMessage(chatId, { 
            text: '✅ *Group name updated successfully!*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (e) {
        console.error('Error updating group name:', e);
        await client.sendMessage(chatId, { 
            text: '❌ *Failed to update group name.*\n\nMake sure the bot is admin and try again.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

async function setGroupPhoto(client, chatId, message, args, sender, pushName, isOwner) {
    const check = await ensureGroupAndAdmin(client, chatId, sender, isOwner);
    if (!check.ok) return;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;
    
    if (!imageMessage) {
        await client.sendMessage(chatId, { 
            text: '📸 *SET GROUP PHOTO*\n\nReply to an image or sticker with `.setgpp`',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }
    
    try {
        // Create temp directory
        const tmpDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        // Download the image
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Save temporarily
        const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        // Update group photo
        await client.updateProfilePicture(chatId, { url: imgPath });
        
        // Clean up
        try { fs.unlinkSync(imgPath); } catch (_) {}
        
        await client.sendMessage(chatId, { 
            text: '✅ *Group profile photo updated successfully!*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        
    } catch (e) {
        console.error('Error updating group photo:', e);
        await client.sendMessage(chatId, { 
            text: '❌ *Failed to update group profile photo.*\n\nMake sure the image is valid and the bot is admin.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = {
    setGroupDescription,
    setGroupName,
    setGroupPhoto
};
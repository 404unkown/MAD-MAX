const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function takeCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage?.stickerMessage) {
            await client.sendMessage(chatId, { 
                text: "🎨 *TAKE COMMAND*\n\nPlease reply to a sticker with .take <packname>\n\n*Example:* .take My Sticker Pack\n*Example:* .take MAD-MAX" 
            }, { quoted: message });
            return;
        }

        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const packname = args.join(' ') || 'MAD-MAX';

        try {
            const stickerBuffer = await downloadMediaMessage(
                {
                    key: {
                        remoteJid: chatId,
                        id: message.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: message.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quotedMessage
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: client.updateMediaMessage
                }
            );

            if (!stickerBuffer) {
                await client.sendMessage(chatId, { 
                    text: '❌ Failed to download sticker' 
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                return;
            }

            const img = new webp.Image();
            await img.load(stickerBuffer);

            const json = {
                'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                'sticker-pack-name': packname,
                'sticker-pack-publisher': pushName || 'User',
                'emojis': ['✨']
            };

            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);

            img.exif = exif;

            const finalBuffer = await img.save(null);

            await client.sendMessage(chatId, {
                sticker: finalBuffer
            }, { quoted: message });

            await client.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });

        } catch (error) {
            console.error('Sticker processing error:', error);
            await client.sendMessage(chatId, { 
                text: '❌ Error processing sticker' 
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }

    } catch (error) {
        console.error('Error in take command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Error processing command' 
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = takeCommand;
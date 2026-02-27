const { addExif } = require('../lib/sticker');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../set');

async function robalCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if message is replying to a sticker
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg?.stickerMessage) {
            await client.sendMessage(chatId, {
                text: `🎨 *Sticker Repackager*\n\n❌ Reply to a sticker with:\n.robal packname|author\n\n*Examples:*\n.robal My Pack|My Bot\n.robal My Pack (author will be default)`
            }, { quoted: message });
            return;
        }
        
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🎨 *Repackaging sticker...*'
        }, { quoted: message });
        
        let packname = '';
        let author = '';
        
        // Parse packname and author from text
        if (args.length > 0) {
            const text = args.join(' ');
            if (text.includes('|')) {
                const parts = text.split('|');
                packname = parts[0].trim();
                author = parts.slice(1).join('|').trim();
            } else {
                packname = text.trim();
                author = config.botname || 'MAD-MAX';
            }
        } else {
            // Use defaults if no arguments
            packname = config.botname || 'MAD-MAX';
            author = pushName || 'User';
        }
        
        // Download the sticker
        let stickerBuffer;
        try {
            const stream = await downloadContentFromMessage(quotedMsg.stickerMessage, 'sticker');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            stickerBuffer = Buffer.concat(chunks);
            
            if (!stickerBuffer || stickerBuffer.length === 0) {
                throw new Error('Failed to download sticker');
            }
        } catch (downloadError) {
            console.error('Sticker download error:', downloadError);
            throw new Error('Failed to download sticker image');
        }
        
        // Check if it's a WebP sticker
        const mimeType = quotedMsg.stickerMessage?.mimetype || '';
        if (!mimeType.includes('webp')) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, {
                text: '❌ Please reply to a WebP sticker!'
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }
        
        // Modify the sticker metadata
        let modifiedSticker;
        try {
            modifiedSticker = await addExif(stickerBuffer, packname || '', author || '');
            
            if (!modifiedSticker || modifiedSticker.length === 0) {
                throw new Error('Failed to modify sticker metadata');
            }
        } catch (exifError) {
            console.error('Exif modification error:', exifError);
            // If addExif fails, use original sticker
            modifiedSticker = stickerBuffer;
            
            await client.sendMessage(chatId, {
                text: '⚠️ Could not modify metadata, sending original sticker...'
            }, { quoted: message });
        }
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });
        
        // Send the modified sticker
        await client.sendMessage(chatId, {
            sticker: modifiedSticker
        }, { quoted: message });
        
        // Show info about what was changed
        await client.sendMessage(chatId, {
            text: `✅ *Sticker Repackaged!*\n\n📦 *Pack:* ${packname || 'Default'}\n👤 *Author:* ${author || 'Default'}\n👤 *Requested by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });
        
        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
        
    } catch (error) {
        console.error('Robbal command error:', error);
        
        let errorMessage = '❌ Failed to modify sticker!';
        
        if (error.message.includes('Failed to download')) {
            errorMessage = '❌ Failed to download sticker. Try again.';
        } else if (error.message.includes('WebP')) {
            errorMessage = '❌ Only WebP stickers are supported.';
        }
        
        await client.sendMessage(chatId, {
            text: `${errorMessage}\n\n_Error: ${error.message}_`
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = robalCommand;
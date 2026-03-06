const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Global channel info
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

async function vcfCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Validate group size
        if (participants.length < 2) {
            await client.sendMessage(chatId, {
                text: '❌ Group must have at least 2 members',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        if (participants.length > 1000) {
            await client.sendMessage(chatId, {
                text: '❌ Group is too large (max 1000 members)',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if user is admin (optional - remove if you want anyone to use it)
        const adminStatus = await isAdmin(client, chatId, sender);
        
        if (!adminStatus.isSenderAdmin && !isOwner) {
            await client.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Show processing message
        await client.sendMessage(chatId, {
            text: `📇 *Generating VCF file*\n\nPlease wait...\n• Members: ${participants.length}`,
            ...channelInfo
        }, { quoted: message });

        // Generate VCF content
        let vcfContent = '';
        participants.forEach(participant => {
            const phoneNumber = participant.id.split('@')[0];
            const displayName = participant.notify || `User_${phoneNumber}`;
            
            // Clean display name for VCF format
            const cleanName = displayName.replace(/[^\x20-\x7E]/g, '').trim() || `User_${phoneNumber}`;
            
            vcfContent += `BEGIN:VCARD\n` +
                          `VERSION:3.0\n` +
                          `FN:${cleanName}\n` +
                          `TEL;TYPE=CELL:+${phoneNumber}\n` +
                          `NOTE:From ${groupMetadata.subject}\n` +
                          `END:VCARD\n\n`;
        });

        // Create temp file
        const sanitizedGroupName = groupMetadata.subject.replace(/[^\w\s-]/g, '_').replace(/\s+/g, '_');
        const tempDir = path.join(__dirname, '..', 'temp');
        
        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const vcfPath = path.join(tempDir, `${sanitizedGroupName}_${Date.now()}.vcf`);
        fs.writeFileSync(vcfPath, vcfContent, 'utf8');

        // Send VCF file
        await client.sendMessage(chatId, {
            document: { url: vcfPath },
            mimetype: 'text/vcard',
            fileName: `${sanitizedGroupName}_contacts.vcf`,
            caption: `📇 *GROUP CONTACTS*\n\n` +
                     `• Group: ${groupMetadata.subject}\n` +
                     `• Members: ${participants.length}\n` +
                     `• Generated: ${new Date().toLocaleString()}\n\n` +
                     `📥 *Import Instructions:*\n` +
                     `1. Download this file\n` +
                     `2. Open your contacts app\n` +
                     `3. Import from VCF file`,
            ...channelInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

        // Cleanup after 5 seconds
        setTimeout(() => {
            if (fs.existsSync(vcfPath)) {
                fs.unlinkSync(vcfPath);
                console.log(`[VCF] Temp file deleted: ${vcfPath}`);
            }
        }, 5000);

        console.log(`[VCF] Generated for ${chatId} with ${participants.length} members`);

    } catch (error) {
        console.error('VCF Error:', error);
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        
        await client.sendMessage(chatId, {
            text: '❌ Failed to generate VCF file. Please try again.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = vcfCommand;
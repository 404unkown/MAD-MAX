const fetch = require('node-fetch');

const carbonCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Get botname from config
        const config = require('../set');
        const botname = config.botname || 'MAD-MAX';
        
        const cap = `Converted By ${botname}`;

        // Check if there's a quoted message
        if (!m.quoted) {
            return await client.sendMessage(chatId, { 
                text: `🎨 *CARBON CODE IMAGE*\n\nPlease quote a code message to convert.\n\nExample:\n1. Send a code message\n2. Reply to it with .carbon` 
            }, { quoted: m });
        }

        // Get the quoted text
        const forq = m.quoted.text;
        
        if (!forq) {
            return await client.sendMessage(chatId, { 
                text: `❌ No text found in quoted message.` 
            }, { quoted: m });
        }

        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎨', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `🎨 *Generating Carbon Image...*\n\nPlease wait while I create your code image.`
        }, { quoted: m });

        // Customize colors based on programming language or use defaults
        const backgroundColor = args[0] || '#1F816D'; // Default green
        const theme = args[1] || 'dracula'; // Default theme
        
        let response = await fetch('https://carbonara.solopov.dev/api/cook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: forq,
                backgroundColor: backgroundColor,
                theme: theme,
                fontSize: '14px',
                language: 'auto',
                windowControls: true,
                paddingVertical: '56px',
                paddingHorizontal: '56px',
            }),
        });

        if (!response.ok) {
            await client.sendMessage(chatId, { 
                delete: processingMsg.key 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: m.key } 
            });
            return await client.sendMessage(chatId, { 
                text: `❌ API failed to fetch a valid response.` 
            }, { quoted: m });
        }

        let per = await response.buffer();

        // Delete processing message
        await client.sendMessage(chatId, { 
            delete: processingMsg.key 
        });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Send the carbon image
        await client.sendMessage(chatId, { 
            image: per, 
            caption: `🎨 *CARBON CODE IMAGE*\n\n${cap}\n\n─ MAD-MAX BOT` 
        }, { quoted: m });

    } catch (error) {
        console.error('Carbon error:', error);
        
        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });
        
        await client.sendMessage(chatId, { 
            text: `❌ An error occurred: ${error.message}` 
        }, { quoted: m });
    }
};

module.exports = {
    carbonCommand
};
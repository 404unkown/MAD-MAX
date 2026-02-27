const fetch = require('node-fetch');

async function flirtCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '💘', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '💘 *Finding the perfect flirt...*'
        }, { quoted: message });

        // Try to get English flirt directly from alternative API
        let flirtMessage = null;
        
        // API 1: Try English flirt API
        try {
            const res = await fetch('https://api.popcat.xyz/pickuplines');
            const data = await res.json();
            flirtMessage = data.pickupline;
            console.log('✅ Using English flirt API');
        } catch (error) {
            console.log('English API failed, trying Hindi...');
        }
        
        // API 2: Try original Hindi API (as backup)
        if (!flirtMessage) {
            try {
                const res = await fetch('https://shizoapi.onrender.com/api/texts/flirt?apikey=shizo');
                const data = await res.json();
                flirtMessage = data.result;
                console.log('✅ Using Hindi flirt API');
            } catch (hindiError) {
                console.log('Hindi API also failed');
            }
        }
        
        // Fallback to local English flirts
        if (!flirtMessage) {
            const englishFlirts = [
                "Are you a magician? Because whenever I look at you, everyone else disappears.",
                "Do you have a map? I keep getting lost in your eyes.",
                "Is your name Google? Because you have everything I've been searching for.",
                "Are you a camera? Because every time I look at you, I smile.",
                "Are you a parking ticket? Because you've got FINE written all over you.",
                "Is your dad a baker? Because you're a cutie pie!",
                "Are you made of copper and tellurium? Because you're Cu-Te.",
                "Do you believe in love at first sight, or should I walk by again?",
                "If you were a vegetable, you'd be a cute-cumber!",
                "Your hand looks heavy—can I hold it for you?"
            ];
            flirtMessage = englishFlirts[Math.floor(Math.random() * englishFlirts.length)];
            console.log('✅ Using local fallback flirts');
        }
        
        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });
        
        await client.sendMessage(chatId, { 
            text: `💘 *Flirt Message* 💘\n\n"${flirtMessage}"\n\n👤 *Requested by:* @${sender.split('@')[0]}\n✨ *MAD-MAX*`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
        
    } catch (error) {
        console.error('Error in flirt command:', error);
        
        // Ultimate fallback
        const fallbackFlirt = "Are you French? Because Eiffel for you.";
        
        await client.sendMessage(chatId, { 
            text: `💘 *Flirt Message* 💘\n\n"${fallbackFlirt}"\n\n👤 *Requested by:* @${sender.split('@')[0]}\n✨ *MAD-MAX*`,
            mentions: [sender]
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
    }
}

module.exports = flirtCommand;
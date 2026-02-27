const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

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

async function quranCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        let surahInput = args[0];
        
        if (!surahInput) {
            await client.sendMessage(chatId, {
                text: `🕋 *QURAN COMMAND*\n\nPlease provide a Surah number or name.\n\n*Usage:* .quran <number/name>\n*Example:* .quran 1\n*Example:* .quran Al-Fatiha\n\n*To see Surah list:* .surahlist`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '⚠️', key: message.key } 
            });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🕋', key: message.key } 
        });

        // Fetch Surah list
        const surahListRes = await axios.get('https://quran-endpoint.vercel.app/quran');
        const surahList = surahListRes.data.data;

        // Find the Surah
        let surahData = surahList.find(surah =>
            surah.number === Number(surahInput) ||
            surah.asma.ar.short.toLowerCase() === surahInput.toLowerCase() ||
            surah.asma.en.short.toLowerCase() === surahInput.toLowerCase()
        );

        if (!surahData) {
            await client.sendMessage(chatId, {
                text: `❌ Couldn't find Surah with "${surahInput}"`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Fetch specific Surah details
        const res = await axios.get(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
        
        if (res.status !== 200) {
            throw new Error(`API error ${res.status}`);
        }

        const json = res.data;

        // Translate tafsir to Urdu and English
        let translatedTafsirUrdu = await translate(json.data.tafsir.id, { to: 'ur', autoCorrect: true });
        let translatedTafsirEnglish = await translate(json.data.tafsir.id, { to: 'en', autoCorrect: true });

        let quranSurah = `
🕋 *Quran: The Holy Book ♥️🌹قرآن مجید🌹♥️*

📖 *Surah ${json.data.number}: ${json.data.asma.ar.long} (${json.data.asma.en.long})*
💫 *Type:* ${json.data.type.en}
✅ *Number of Verses:* ${json.data.ayahCount}

⚡🔮 *Explanation (Urdu):*
${translatedTafsirUrdu.text}

⚡🔮 *Explanation (English):*
${translatedTafsirEnglish.text}`;

        // Send image with Surah details
        await client.sendMessage(chatId, {
            image: { url: `https://files.catbox.moe/8fy6up.jpg` },
            caption: quranSurah,
            mentions: [sender],
            contextInfo: {
                ...channelInfo.contextInfo,
                mentionedJid: [sender]
            }
        }, { quoted: message });

        // Send recitation as document (always works)
if (json.data.recitation?.full) {
    try {
        await client.sendMessage(chatId, {
            document: { url: json.data.recitation.full },
            mimetype: 'audio/mpeg',
            fileName: `Surah_${json.data.number}_Recitation.mp3`,
            caption: `🎵 *Surah ${json.data.number} Recitation*\n\nClick to download and play`,
            ...channelInfo
        }, { quoted: message });
    } catch (audioError) {
        console.log('Audio recitation failed, skipping...');
        // Silently fail
    }
}

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Quran Command Error:", error);
        
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = quranCommand;
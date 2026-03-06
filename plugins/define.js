const axios = require('axios');

async function defineCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, {
                text: "📝 *Usage:* .define [word]\n\nExample: `.define hello`"
            }, { quoted: message });
            return;
        }

        const word = args.join(' ');
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: `📖 *Looking up definition for:* "${word}"...`
        }, { quoted: message });

        const response = await axios.get(url);
        const definitionData = response.data[0];

        if (!definitionData) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, {
                text: `❌ *Word not found:* "${word}"\nPlease check the spelling and try again.`
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Get the first meaning and definition
        const definition = definitionData.meanings[0]?.definitions[0]?.definition || 'No definition available';
        const example = definitionData.meanings[0]?.definitions[0]?.example || 'No example available';
        const synonyms = definitionData.meanings[0]?.definitions[0]?.synonyms?.slice(0, 5).join(', ') || 'No synonyms available';
        const antonyms = definitionData.meanings[0]?.definitions[0]?.antonyms?.slice(0, 5).join(', ') || 'No antonyms available';
        const phonetics = definitionData.phonetics[0]?.text || definitionData.phonetic || 'No pronunciation available';
        const audio = definitionData.phonetics.find(p => p.audio)?.audio || null;

        // Format the response
        const wordInfo = `
📖 *Word:* ${definitionData.word}
🗣️ *Pronunciation:* ${phonetics}
📚 *Part of Speech:* ${definitionData.meanings[0]?.partOfSpeech || 'N/A'}

🔍 *Definition:*
${definition}

✍️ *Example:*
${example}

📝 *Synonyms:* ${synonyms}
🚫 *Antonyms:* ${antonyms}

💡 *Powered by 404 TECH*`;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Send audio pronunciation if available
        if (audio) {
            try {
                await client.sendMessage(chatId, { 
                    audio: { url: audio }, 
                    mimetype: 'audio/mpeg',
                    ptt: true 
                }, { quoted: message });
            } catch (audioError) {
                console.log('Audio sending failed, continuing with text only');
            }
        }

        await client.sendMessage(chatId, {
            text: wordInfo
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("❌ Define command error:", error);
        
        if (error.response && error.response.status === 404) {
            await client.sendMessage(chatId, {
                text: `❌ *Word not found*\n\nPlease check the spelling and try again.`
            }, { quoted: message });
        } else {
            await client.sendMessage(chatId, {
                text: `⚠️ *Error fetching definition*\n\nPlease try again later.`
            }, { quoted: message });
        }
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = defineCommand;
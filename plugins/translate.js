const fetch = require('node-fetch');

// Language codes mapping for reference
const LANG_CODES = {
    'af': 'Afrikaans', 'sq': 'Albanian', 'ar': 'Arabic', 'hy': 'Armenian',
    'az': 'Azerbaijani', 'eu': 'Basque', 'be': 'Belarusian', 'bn': 'Bengali',
    'bs': 'Bosnian', 'bg': 'Bulgarian', 'ca': 'Catalan', 'ceb': 'Cebuano',
    'ny': 'Chichewa', 'zh': 'Chinese', 'co': 'Corsican', 'hr': 'Croatian',
    'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English',
    'eo': 'Esperanto', 'et': 'Estonian', 'tl': 'Filipino', 'fi': 'Finnish',
    'fr': 'French', 'fy': 'Frisian', 'gl': 'Galician', 'ka': 'Georgian',
    'de': 'German', 'el': 'Greek', 'gu': 'Gujarati', 'ht': 'Haitian Creole',
    'ha': 'Hausa', 'haw': 'Hawaiian', 'he': 'Hebrew', 'hi': 'Hindi',
    'hmn': 'Hmong', 'hu': 'Hungarian', 'is': 'Icelandic', 'ig': 'Igbo',
    'id': 'Indonesian', 'ga': 'Irish', 'it': 'Italian', 'ja': 'Japanese',
    'jw': 'Javanese', 'kn': 'Kannada', 'kk': 'Kazakh', 'km': 'Khmer',
    'rw': 'Kinyarwanda', 'ko': 'Korean', 'ku': 'Kurdish', 'ky': 'Kyrgyz',
    'lo': 'Lao', 'la': 'Latin', 'lv': 'Latvian', 'lt': 'Lithuanian',
    'lb': 'Luxembourgish', 'mk': 'Macedonian', 'mg': 'Malagasy', 'ms': 'Malay',
    'ml': 'Malayalam', 'mt': 'Maltese', 'mi': 'Maori', 'mr': 'Marathi',
    'mn': 'Mongolian', 'my': 'Myanmar', 'ne': 'Nepali', 'no': 'Norwegian',
    'or': 'Odia', 'ps': 'Pashto', 'fa': 'Persian', 'pl': 'Polish',
    'pt': 'Portuguese', 'pa': 'Punjabi', 'ro': 'Romanian', 'ru': 'Russian',
    'sm': 'Samoan', 'gd': 'Scots Gaelic', 'sr': 'Serbian', 'st': 'Sesotho',
    'sn': 'Shona', 'sd': 'Sindhi', 'si': 'Sinhala', 'sk': 'Slovak',
    'sl': 'Slovenian', 'so': 'Somali', 'es': 'Spanish', 'su': 'Sundanese',
    'sw': 'Swahili', 'sv': 'Swedish', 'tg': 'Tajik', 'ta': 'Tamil',
    'tt': 'Tatar', 'te': 'Telugu', 'th': 'Thai', 'tr': 'Turkish',
    'tk': 'Turkmen', 'uk': 'Ukrainian', 'ur': 'Urdu', 'ug': 'Uyghur',
    'uz': 'Uzbek', 'vi': 'Vietnamese', 'cy': 'Welsh', 'xh': 'Xhosa',
    'yi': 'Yiddish', 'yo': 'Yoruba', 'zu': 'Zulu'
};

async function handleTranslateCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Show typing indicator
        await client.presenceSubscribe(chatId);
        await client.sendPresenceUpdate('composing', chatId);

        let textToTranslate = '';
        let lang = '';

        // Check if it's a reply
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage) {
            // Get text from quoted message
            textToTranslate = quotedMessage.conversation || 
                            quotedMessage.extendedTextMessage?.text || 
                            quotedMessage.imageMessage?.caption || 
                            quotedMessage.videoMessage?.caption || 
                            '';

            // Get language from args
            lang = args[0] || '';
            
            if (!lang) {
                return client.sendMessage(chatId, {
                    text: `🔤 *TRANSLATOR*\n\n*Usage:* Reply to a message with: .translate <lang_code>\n\n*Example:*\n.translate fr  (translates to French)\n.translate es  (translates to Spanish)\n\n*Common language codes:*\n• en - English\n• fr - French\n• es - Spanish\n• de - German\n• it - Italian\n• pt - Portuguese\n• ru - Russian\n• ja - Japanese\n• ko - Korean\n• zh - Chinese\n• ar - Arabic\n• hi - Hindi`
                }, { quoted: message });
            }
        } else {
            // Parse command arguments for direct message
            if (args.length < 2) {
                return client.sendMessage(chatId, {
                    text: `🔤 *TRANSLATOR*\n\n*Usage:* .translate <text> <lang_code>\n\n*Example:*\n.translate hello fr\n.translate how are you? es\n\n*Common language codes:*\n• en - English\n• fr - French\n• es - Spanish\n• de - German\n• it - Italian\n• pt - Portuguese\n• ru - Russian\n• ja - Japanese\n• ko - Korean\n• zh - Chinese\n• ar - Arabic\n• hi - Hindi`
                }, { quoted: message });
            }

            lang = args.pop(); // Get language code
            textToTranslate = args.join(' '); // Get text to translate
        }

        if (!textToTranslate) {
            return client.sendMessage(chatId, {
                text: '❌ No text found to translate. Please provide text or reply to a message.'
            }, { quoted: message });
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Try multiple translation APIs in sequence
        let translatedText = null;
        let error = null;

        // Try API 1 (Google Translate API)
        try {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    translatedText = data[0][0][0];
                }
            }
        } catch (e) {
            error = e;
        }

        // If API 1 fails, try API 2
        if (!translatedText) {
            try {
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.responseData && data.responseData.translatedText) {
                        translatedText = data.responseData.translatedText;
                    }
                }
            } catch (e) {
                error = e;
            }
        }

        // If API 2 fails, try API 3
        if (!translatedText) {
            try {
                const response = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.translated) {
                        translatedText = data.translated;
                    }
                }
            } catch (e) {
                error = e;
            }
        }

        if (!translatedText) {
            throw new Error('All translation APIs failed');
        }

        // Get language name
        const langName = LANG_CODES[lang] || lang.toUpperCase();

        // Send translation
        await client.sendMessage(chatId, {
            text: `🔤 *Translation to ${langName}*\n\n🌍 *Original:*\n${textToTranslate}\n\n📝 *Translated:*\n${translatedText}\n\n_Requested by: ${pushName}_`
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('❌ Error in translate command:', error);
        await client.sendMessage(chatId, {
            text: '❌ Failed to translate text. Please try again later.\n\nMake sure you provided a valid language code (e.g., fr, es, de).'
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = {
    handleTranslateCommand
};
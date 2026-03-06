const googleTTS = require('google-tts-api');
const { channelInfo } = require('../lib/messageConfig');

// Comprehensive language support including African languages
const SUPPORTED_LANGUAGES = {
    // Major African Languages
    'af': 'Afrikaans (South Africa)',
    'am': 'Amharic (Ethiopia)',
    'ha': 'Hausa (Nigeria)',
    'ig': 'Igbo (Nigeria)',
    'ki': 'Kikuyu (Kenya)',
    'rw': 'Kinyarwanda (Rwanda)',
    'ln': 'Lingala (DRC)',
    'om': 'Oromo (Ethiopia)',
    'rn': 'Rundi (Burundi)',
    'sn': 'Shona (Zimbabwe)',
    'so': 'Somali (Somalia)',
    'sw': 'Swahili (Kenya/Tanzania)',
    'ti': 'Tigrinya (Ethiopia/Eritrea)',
    'tw': 'Twi (Ghana)',
    'xh': 'Xhosa (South Africa)',
    'yo': 'Yoruba (Nigeria)',
    'zu': 'Zulu (South Africa)',
    'ny': 'Chichewa (Malawi)',
    'st': 'Sesotho (Lesotho)',
    'tn': 'Tswana (Botswana)',
    've': 'Venda (South Africa)',
    'ts': 'Tsonga (South Africa)',
    'ss': 'Swati (Eswatini)',
    'nr': 'South Ndebele (South Africa)',
    
    // Other African languages (WAXAL project - coming soon)
    'ach': 'Acholi (Uganda)',
    'ak': 'Akan (Ghana)',
    'dga': 'Dagaare (Ghana)',
    'dag': 'Dagbani (Ghana)',
    'luo': 'Dholuo (Kenya)',
    'ee': 'Ewe (Ghana/Togo)',
    'fat': 'Fante (Ghana)',
    'ff': 'Fulani (West Africa)',
    'kpos': 'Ikposo (Togo)',
    'lg': 'Luganda (Uganda)',
    'myx': 'Masaaba (Uganda)',
    'nyn': 'Nyankole (Uganda)',
    'cgg': 'Rukiga (Uganda)',
    'xog': 'Soga (Uganda)',
    'mg': 'Malagasy (Madagascar)',
    
    // Other international languages
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'tr': 'Turkish',
    'pl': 'Polish',
    'id': 'Indonesian',
    'ms': 'Malay',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'ur': 'Urdu',
    'fa': 'Persian'
};

// Map language codes to proper locale codes for Google TTS
function getLocaleCode(langCode) {
    const localeMap = {
        'af': 'af-ZA',
        'am': 'am-ET',
        'ha': 'ha-NG',
        'ig': 'ig-NG',
        'ki': 'ki-KE',
        'rw': 'rw-RW',
        'ln': 'ln-CD',
        'om': 'om-ET',
        'rn': 'rn-BI',
        'sn': 'sn-ZW',
        'so': 'so-SO',
        'sw': 'sw-KE',
        'ti': 'ti-ET',
        'tw': 'tw-GH',
        'xh': 'xh-ZA',
        'yo': 'yo-NG',
        'zu': 'zu-ZA',
        'ny': 'ny-MW',
        'st': 'st-ZA',
        'tn': 'tn-ZA',
        've': 've-ZA',
        'ts': 'ts-ZA',
        'ss': 'ss-ZA',
        'nr': 'nr-ZA',
        'en': 'en-US',
        'hi': 'hi-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ru': 'ru-RU',
        'ar': 'ar-SA',
        'pt': 'pt-PT',
        'nl': 'nl-NL',
        'tr': 'tr-TR',
        'pl': 'pl-PL',
        'id': 'id-ID',
        'ms': 'ms-MY',
        'th': 'th-TH',
        'vi': 'vi-VN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'mr': 'mr-IN',
        'ur': 'ur-PK',
        'fa': 'fa-IR'
    };
    
    return localeMap[langCode] || langCode + '-' + langCode.toUpperCase();
}

async function ttsCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if there are arguments
        if (args.length === 0) {
            // Group African languages for display
            const africanLanguages = Object.entries(SUPPORTED_LANGUAGES)
                .filter(([code]) => !['en', 'hi', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'pt', 'nl', 'tr', 'pl', 'id', 'ms', 'th', 'vi', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'mr', 'ur', 'fa'].includes(code))
                .map(([code, name]) => `${code} = ${name}`)
                .slice(0, 15) // Show first 15 to avoid message too long
                .join('\n');
            
            await client.sendMessage(chatId, {
                text: `?? *TEXT TO SPEECH*\n\nConvert text to voice in any language!\n\n*Usage:*\n\`.say <language> ;<text>\`\n\n*Examples:*\n\`.say en ;Hello there\` - English\n\`.say sw ;Habari yako\` - Swahili\n\`.say yo ;Bawo ni o\` - Yoruba\n\`.say ha ;Ina kwana\` - Hausa\n\`.say ig ;Kedu\` - Igbo\n\`.say xh ;Molo\` - Xhosa\n\`.say zu ;Sawubona\` - Zulu\n\n*?? AFRICAN LANGUAGES:*\n${africanLanguages}\n\n*?? Other languages:* en, hi, es, fr, de, ja, ko, zh, ar, pt...`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Parse language and text (format: "en ;Hello there")
        const fullText = args.join(' ');
        const separatorIndex = fullText.indexOf(';');
        
        if (separatorIndex === -1) {
            await client.sendMessage(chatId, {
                text: "?? *Invalid Format*\n\nUse: `.say <language> ;<text>`\nExample: `.say sw ;Habari yako`",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const langCode = fullText.substring(0, separatorIndex).trim().toLowerCase();
        const text = fullText.substring(separatorIndex + 1).trim();

        // Validate language code
        if (!SUPPORTED_LANGUAGES[langCode]) {
            await client.sendMessage(chatId, {
                text: `? *Unsupported Language*\n\nLanguage code "${langCode}" is not supported.\n\nTry one of these African languages: sw, yo, ha, ig, xh, zu, af, am, rw, sn, so, ki, om, rn, tw, ny`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Validate text
        if (!text) {
            await client.sendMessage(chatId, {
                text: "?? Please provide text to convert to speech after the language code.",
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '?', key: message.key } 
        });

        console.log(`TTS: Converting "${text}" to ${langCode} (${SUPPORTED_LANGUAGES[langCode]})`);

        // Get the proper locale code
        const localeCode = getLocaleCode(langCode);

        // Generate TTS audio URL
        const url = googleTTS.getAudioUrl(text, {
            lang: localeCode,
            slow: false,
            host: 'https://translate.google.com',
        });

        // Send the audio as a voice note (PTT)
        await client.sendMessage(chatId, { 
            audio: { url: url },
            mimetype: 'audio/mp4', 
            ptt: true
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '??', key: message.key } 
        });

    } catch (error) {
        console.error('TTS command error:', error);
        
        await client.sendMessage(chatId, {
            text: "? Failed to generate speech. Please try again later.\n\nNote: Some African languages may not be fully supported in TTS yet (Microsoft Azure has better support for Igbo & Yoruba currently). [citation:8]",
            ...channelInfo
        }, { quoted: message });

        await client.sendMessage(chatId, { 
            react: { text: '?', key: message.key } 
        });
    }
}

module.exports = ttsCommand;
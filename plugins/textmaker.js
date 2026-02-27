const axios = require('axios');
const mumaker = require('mumaker');

// Global channel info (to match your main.js)
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

// Reusable message templates
const messageTemplates = {
    error: (message) => ({
        text: message,
        ...channelInfo
    }),
    success: (text, imageUrl) => ({
        image: { url: imageUrl },
        caption: `🎨 *TEXT EFFECT GENERATED*\n\nStyle: ${text}\n\n> Powered by MAD-MAX`,
        ...channelInfo
    })
};

async function textmakerCommand(client, chatId, message, args, sender, pushName, isOwner, type) {
    try {
        // Get the text from args (everything after the command)
        const text = args.join(' ').trim();

        if (!text) {
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return await client.sendMessage(chatId, 
                messageTemplates.error(`✏️ *TEXT MAKER*\n\nPlease provide text to generate\n\n*Example:* .${type} MAD-MAX\n*Example:* .${type} Hello World`)
            , { quoted: message });
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        try {
            let result;
            switch (type) {
                case 'metallic':
                    result = await mumaker.ephoto("https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html", text);
                    break;
                case 'ice':
                    result = await mumaker.ephoto("https://en.ephoto360.com/ice-text-effect-online-101.html", text);
                    break;
                case 'snow':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html", text);
                    break;
                case 'impressive':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html", text);
                    break;
                case 'matrix':
                    result = await mumaker.ephoto("https://en.ephoto360.com/matrix-text-effect-154.html", text);
                    break;
                case 'light':
                    result = await mumaker.ephoto("https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html", text);
                    break;
                case 'neon':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html", text);
                    break;
                case 'devil':
                    result = await mumaker.ephoto("https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html", text);
                    break;
                case 'purple':
                    result = await mumaker.ephoto("https://en.ephoto360.com/purple-text-effect-online-100.html", text);
                    break;
                case 'thunder':
                    result = await mumaker.ephoto("https://en.ephoto360.com/thunder-text-effect-online-97.html", text);
                    break;
                case 'leaves':
                    result = await mumaker.ephoto("https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html", text);
                    break;
                case '1917':
                case '1997':
                    result = await mumaker.ephoto("https://en.ephoto360.com/1917-style-text-effect-523.html", text);
                    break;
                case 'arena':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html", text);
                    break;
                case 'hacker':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", text);
                    break;
                case 'sand':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html", text);
                    break;
                case 'blackpink':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html", text);
                    break;
                case 'glitch':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html", text);
                    break;
                case 'fire':
                    result = await mumaker.ephoto("https://en.ephoto360.com/flame-lettering-effect-372.html", text);
                    break;
                case 'dragonball':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", text);
                    break;
                case 'naruto':
                    result = await mumaker.ephoto("https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", text);
                    break;
                case 'boom':
                    result = await mumaker.ephoto("https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html", text);
                    break;
                case 'water':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-water-effect-text-online-295.html", text);
                    break;
                case 'underwater':
                    result = await mumaker.ephoto("https://en.ephoto360.com/3d-underwater-text-effect-online-682.html", text);
                    break;
                case '4d':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-glowing-text-effects-online-706.html", text);
                    break;
                case 'boken':
                    result = await mumaker.ephoto("https://en.ephoto360.com/bokeh-text-effect-86.html", text);
                    break;
                case 'starnight':
                    result = await mumaker.ephoto("https://en.ephoto360.com/stars-night-online-84.html", text);
                    break;
                case 'gold':
                    result = await mumaker.ephoto("https://en.ephoto360.com/modern-gold-purple-175.html", text);
                    break;
                case 'xmd':
                    result = await mumaker.ephoto("https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html", text);
                    break;
                case '3d':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html", text);
                    break;
                case 'luxury':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html", text);
                    break;
                case 'american':
                    result = await mumaker.ephoto("https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html", text);
                    break;
                case 'embroider':
                    result = await mumaker.ephoto("https://en.ephoto360.com/embroider-159.html", text);
                    break;
                case 'foggyglass':
                    result = await mumaker.ephoto("https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html", text);
                    break;
                case 'silver':
                    result = await mumaker.ephoto("https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html", text);
                    break;
                case 'wetglass':
                    result = await mumaker.ephoto("https://en.ephoto360.com/write-text-on-wet-glass-online-589.html", text);
                    break;
                default:
                    await client.sendMessage(chatId, { 
                        react: { text: '❌', key: message.key } 
                    });
                    return await client.sendMessage(chatId, 
                        messageTemplates.error("❌ Invalid text generator type")
                    , { quoted: message });
            }

            if (!result || !result.image) {
                throw new Error('No image URL received from the API');
            }

            await client.sendMessage(chatId, messageTemplates.success(type, result.image), { quoted: message });

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (error) {
            console.error('Error in text generator:', error);
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, 
                messageTemplates.error(`❌ Error: ${error.message}`)
            , { quoted: message });
        }
    } catch (error) {
        console.error('Error in textmaker command:', error);
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
        await client.sendMessage(chatId, 
            messageTemplates.error("❌ An error occurred. Please try again later.")
        , { quoted: message });
    }
}

module.exports = textmakerCommand;
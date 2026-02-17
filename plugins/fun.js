const config = require('../set');

async function compatibilityCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '💘', key: message.key } 
        });

        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJid.length < 2) {
            await client.sendMessage(chatId, { 
                text: "💕 *Compatibility Check*\n\nPlease mention two users to calculate compatibility.\n*Usage:* `.compatibility @user1 @user2`\n\n*Example:* `.compatibility @john @jane`"
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        let user1 = mentionedJid[0]; 
        let user2 = mentionedJid[1]; 
        const specialNumber = config.owner ? `${config.owner}@s.whatsapp.net` : null;

        // Calculate a random compatibility score (between 1 to 1000)
        let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

        // Check if one of the mentioned users is the special number
        if (user1 === specialNumber || user2 === specialNumber) {
            compatibilityScore = 1000; // Special case for owner number
        }

        // Send the compatibility message
        await client.sendMessage(chatId, {
            text: `💖 *Compatibility Result* 💖\n\n👤 @${user1.split('@')[0]}\n➕\n👤 @${user2.split('@')[0]}\n\n📊 *Score:* ${compatibilityScore}/1000\n\n${getCompatibilityMessage(compatibilityScore)}`,
            mentions: [user1, user2],
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.log(error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

function getCompatibilityMessage(score) {
    if (score >= 900) return "💖 A match made in heaven!";
    if (score >= 700) return "😍 Strong connection!";
    if (score >= 500) return "😊 Good compatibility!";
    if (score >= 300) return "🤔 It's complicated!";
    return "💔 Not the best match!";
}

async function auraCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '💀', key: message.key } 
        });

        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        let user;
        if (mentionedJid.length >= 1) {
            user = mentionedJid[0];
        } else {
            user = sender; // Default to sender if no mention
        }
        
        const specialNumber = config.owner ? `${config.owner}@s.whatsapp.net` : null;

        // Calculate a random aura score (between 1 to 1000)
        let auraScore = Math.floor(Math.random() * 1000) + 1;

        // Check if the user is the special number
        if (user === specialNumber) {
            auraScore = 999999; // Special case for owner
        }

        // Send the aura message
        await client.sendMessage(chatId, {
            text: `💀 *Aura Check* 💀\n\n👤 @${user.split('@')[0]}\n\n📊 *Aura Score:* ${auraScore}/1000 🗿\n\n${getAuraMessage(auraScore)}`,
            mentions: [user],
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.log(error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

function getAuraMessage(score) {
    if (score >= 900) return "✨ Legendary aura!";
    if (score >= 700) return "🌟 Powerful aura!";
    if (score >= 500) return "⚡ Decent aura!";
    if (score >= 300) return "🌫️ Fading aura!";
    return "💫 Needs improvement!";
}

async function eightBallCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const question = args.join(' ').trim();
        
        if (!question) {
            await client.sendMessage(chatId, { 
                text: "🎱 *Magic 8-Ball*\n\nAsk a yes/no question!\n*Usage:* `.8ball Will I be rich?`\n\n*Example:* `.8ball Will I get a new job?`"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎱', key: message.key } 
        });

        const responses = [
            "Yes!", "No.", "Maybe...", "Definitely!", "Not sure.", 
            "Ask again later.", "I don't think so.", "Absolutely!", 
            "No way!", "Looks promising!", "Without a doubt!", 
            "Very likely!", "Chances are low.", "Signs point to yes!",
            "Cannot predict now.", "Concentrate and ask again."
        ];
        
        const answer = responses[Math.floor(Math.random() * responses.length)];
        
        await client.sendMessage(chatId, {
            text: `🎱 *Magic 8-Ball* 🎱\n\n❓ *Question:* ${question}\n🔮 *Answer:* ${answer}\n\n👤 *Asked by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.log(error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

async function complimentCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const compliments = [
            "You're amazing just the way you are! 💖",
            "You light up every room you walk into! 🌟",
            "Your smile is contagious! 😊",
            "You're a genius in your own way! 🧠",
            "You bring happiness to everyone around you! 🥰",
            "You're like a human sunshine! ☀️",
            "Your kindness makes the world a better place! ❤️",
            "You're unique and irreplaceable! ✨",
            "You're a great listener and a wonderful friend! 🤗",
            "Your positive vibes are truly inspiring! 💫",
            "You're stronger than you think! 💪",
            "Your creativity is beyond amazing! 🎨",
            "You make life more fun and interesting! 🎉",
            "Your energy is uplifting to everyone around you! 🔥",
            "You're a true leader, even if you don't realize it! 🏆",
            "Your words have the power to make people smile! 😊",
            "You're so talented, and the world needs your skills! 🎭",
            "You're a walking masterpiece of awesomeness! 🎨",
            "You're proof that kindness still exists in the world! 💕",
            "You make even the hardest days feel a little brighter! ☀️"
        ];

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '😊', key: message.key } 
        });

        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedSender = quotedMsg?.participant || (quotedMsg?.key ? quotedMsg.key.remoteJid : null);
        
        let target = mentionedJid[0] || quotedSender;
        const targetName = target ? target.split('@')[0] : null;

        let messageText;
        let mentions = [sender];
        
        if (target) {
            messageText = `😊 *Compliment*\n\n@${sender.split('@')[0]} sent a compliment to @${targetName}:\n\n✨ *${randomCompliment}* ✨`;
            mentions.push(target);
        } else {
            messageText = `😊 *Compliment*\n\n@${sender.split('@')[0]}, here's a compliment for you:\n\n✨ *${randomCompliment}* ✨`;
        }

        await client.sendMessage(chatId, { 
            text: messageText, 
            mentions: mentions 
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.log(error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

async function lovetestCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '💘', key: message.key } 
        });

        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJid.length < 2) {
            await client.sendMessage(chatId, { 
                text: "💘 *Love Test*\n\nTag two users!\n*Usage:* `.lovetest @user1 @user2`\n\n*Example:* `.lovetest @john @jane`"
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        let user1 = mentionedJid[0];
        let user2 = mentionedJid[1];

        let lovePercent = Math.floor(Math.random() * 100) + 1;

        let messages = [
            { range: [90, 100], text: "💖 *A match made in heaven!* True love exists!" },
            { range: [75, 89], text: "😍 *Strong connection!* This love is deep and meaningful." },
            { range: [50, 74], text: "😊 *Good compatibility!* You both can make it work." },
            { range: [30, 49], text: "🤔 *It's complicated!* Needs effort, but possible!" },
            { range: [10, 29], text: "😅 *Not the best match!* Maybe try being just friends?" },
            { range: [1, 9], text: "💔 *Uh-oh!* This love is as real as a Bollywood breakup!" }
        ];

        let loveMessage = messages.find(msg => lovePercent >= msg.range[0] && lovePercent <= msg.range[1]).text;

        let messageText = `💘 *Love Compatibility Test* 💘\n\n❤️ @${user1.split("@")[0]}\n➕\n❤️ @${user2.split("@")[0]}\n\n📊 *Love Percentage:* ${lovePercent}%\n\n${loveMessage}`;

        await client.sendMessage(chatId, { 
            text: messageText, 
            mentions: [user1, user2] 
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.log(error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

async function emojiCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Join the words together
        let text = args.join(" ");
        
        // If no valid text is provided
        if (!text) {
            await client.sendMessage(chatId, { 
                text: "🔤 *Text to Emoji Converter*\n\nPlease provide some text to convert into emojis!\n*Usage:* `.emoji hello world`\n\n*Example:* `.emoji hello` → 🅗🅔🅛🅛🅞"
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🔤', key: message.key } 
        });

        // Map text to corresponding emoji characters
        let emojiMapping = {
            "a": "🅰️", "b": "🅱️", "c": "🇨", "d": "🇩", "e": "🇪", "f": "🇫", 
            "g": "🇬", "h": "🇭", "i": "🇮", "j": "🇯", "k": "🇰", "l": "🇱", 
            "m": "🇲", "n": "🇳", "o": "🅾️", "p": "🇵", "q": "🇶", "r": "🇷", 
            "s": "🇸", "t": "🇹", "u": "🇺", "v": "🇻", "w": "🇼", "x": "🇽", 
            "y": "🇾", "z": "🇿",
            "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣", 
            "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣",
            " ": "  ", // space
        };

        // Convert the input text into emoji form
        let emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

        await client.sendMessage(chatId, {
            text: `🔤 *Emoji Converter*\n\n*Original:* ${text}\n\n*Converted:*\n${emojiText}\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.log(error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = {
    compatibilityCommand,
    auraCommand,
    eightBallCommand,
    complimentCommand,
    lovetestCommand,
    emojiCommand
};
// Simple in-memory storage for auto-react settings
const autoReactSettings = {
    enabled: false,
    emoji: '💚',
    mode: 'simple' // 'simple' or 'all'
};

const emojis = ['❤️', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣️', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '🙂', '🤗', '😌', '😉', '😊', '🎊', '🎉', '🎁', '🎈', '👋'];
const mojis = ['💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','❤️‍🔥','❤️‍🩹','💯','♨️','💢','💬','👁️‍🗨️','🗨️','🗯️','💭','💤','🌐','♠️','♥️','♦️','♣️','🃏','🀄️','🎴','🎭️','🔇','🔈️','🔉','🔊','🔔','🔕','🎼','🎵','🎶','💹','🏧','🚮','🚰','♿️','🚹️','🚺️','🚻','🚼️','🚾','🛂','🛃','🛄','🛅','⚠️','🚸','⛔️','🚫','🚳','🚭️','🚯','🚱','🚷','📵','🔞','☢️','☣️','⬆️','↗️','➡️','↘️','⬇️','↙️','⬅️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔃','🔄','🔙','🔚','🔛','🔜','🔝','🛐','⚛️','🕉️','✡️','☸️','☯️','✝️','☦️','☪️','☮️','🕎','🔯','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','⛎','🔀','🔁','🔂','▶️','⏩️','⏭️','⏯️','◀️','⏪️','⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','⏏️','🎦','🔅','🔆','📶','📳','📴','♀️','♂️','⚧','✖️','➕','➖','➗','♾️','‼️','⁉️','❓️','❔','❕','❗️','〰️','💱','💲','⚕️','♻️','⚜️','🔱','📛','🔰','⭕️','✅','☑️','✔️','❌','❎','➰','➿','〽️','✳️','✴️','❇️','©️','®️','™️','#️⃣','*️⃣','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔠','🔡','🔢','🔣','🔤','🅰️','🆎','🅱️','🆑','🆒','🆓','ℹ️','🆔','Ⓜ️','🆕','🆖','🅾️','🆗','🅿️','🆘','🆙','🆚','🈁','🈂️','🈷️','🈶','🈯️','🉐','🈹','🈚️','🈲','🉑','🈸','🈴','🈳','㊗️','㊙️','🈺','🈵','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫️','⚪️','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛️','⬜️','◼️','◻️','◾️','◽️','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔳','🔲'];

const areact = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        if (!isOwner) {
            return await client.sendMessage(chatId, { 
                text: '❌ *Owner only command*' 
            }, { quoted: m });
        }

        const action = args[0]?.toLowerCase();

        if (!action) {
            return await client.sendMessage(chatId, { 
                text: `⚙️ *AUTO REACTION SETTINGS*\n\n` +
                      `Status: ${autoReactSettings.enabled ? '✅ ON' : '❌ OFF'}\n` +
                      `Mode: ${autoReactSettings.mode}\n` +
                      `Default Emoji: ${autoReactSettings.emoji}\n\n` +
                      `*Commands:*\n` +
                      `.areact on - Enable auto reaction\n` +
                      `.areact off - Disable auto reaction\n` +
                      `.areact simple - Use random simple emojis\n` +
                      `.areact all - Use random all emojis\n` +
                      `.areact set [emoji] - Set default emoji\n\n` +
                      `_Note: When mode is simple or all, it uses random emojis._\n` +
                      `_Default emoji is used when mode is set to simple/all?_ 🤔 Actually default is only used as fallback._` 
            }, { quoted: m });
        }

        if (action === 'on') {
            autoReactSettings.enabled = true;
            await client.sendMessage(chatId, { 
                text: `✅ *Auto reaction ENABLED*\nMode: ${autoReactSettings.mode}\nEmoji: ${autoReactSettings.mode === 'simple' ? 'Random simple' : autoReactSettings.mode === 'all' ? 'Random all' : autoReactSettings.emoji}` 
            }, { quoted: m });
        }
        else if (action === 'off') {
            autoReactSettings.enabled = false;
            await client.sendMessage(chatId, { 
                text: '❌ *Auto reaction DISABLED*' 
            }, { quoted: m });
        }
        else if (action === 'simple') {
            autoReactSettings.mode = 'simple';
            await client.sendMessage(chatId, { 
                text: `✅ *Mode set to SIMPLE*\n${autoReactSettings.enabled ? 'Auto reaction is ON' : 'Enable with .areact on'}` 
            }, { quoted: m });
        }
        else if (action === 'all') {
            autoReactSettings.mode = 'all';
            await client.sendMessage(chatId, { 
                text: `✅ *Mode set to ALL*\n${autoReactSettings.enabled ? 'Auto reaction is ON' : 'Enable with .areact on'}` 
            }, { quoted: m });
        }
        else if (action === 'set') {
            const emoji = args[1];
            if (!emoji) {
                return await client.sendMessage(chatId, { 
                    text: '❌ Please provide an emoji.\nExample: .areact set 💚' 
                }, { quoted: m });
            }
            autoReactSettings.emoji = emoji;
            await client.sendMessage(chatId, { 
                text: `✅ *Default reaction emoji set to* ${emoji}` 
            }, { quoted: m });
        }
        else {
            await client.sendMessage(chatId, { 
                text: '❌ Invalid command. Use: on/off/simple/all/set' 
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Error in areact command:', error);
        await client.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: m });
    }
};

const handleAutoReact = async (client, m) => {
    try {
        // Add debug logging
        console.log('🔄 handleAutoReact called for message from:', m.sender);
        console.log('Settings:', JSON.stringify(autoReactSettings));
        
        // Check if auto-react is enabled
        if (!autoReactSettings.enabled) {
            console.log('❌ Auto-react is disabled');
            return;
        }
        
        // Don't react to own messages
        if (m.key.fromMe) {
            console.log('❌ Skipping own message');
            return;
        }
        
        // Check if message has chat
        if (!m.chat) {
            console.log('❌ No chat ID');
            return;
        }

        // Don't react to status updates
        if (m.chat === 'status@broadcast') {
            console.log('❌ Skipping status broadcast');
            return;
        }

        // Small delay to ensure message is processed
        await new Promise(resolve => setTimeout(resolve, 500));

        let reactionEmoji;
        
        if (autoReactSettings.mode === 'simple') {
            reactionEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            console.log(`✅ Selected simple emoji: ${reactionEmoji}`);
        } 
        else if (autoReactSettings.mode === 'all') {
            reactionEmoji = mojis[Math.floor(Math.random() * mojis.length)];
            console.log(`✅ Selected all emoji: ${reactionEmoji}`);
        } 
        else {
            reactionEmoji = autoReactSettings.emoji;
            console.log(`✅ Using default emoji: ${reactionEmoji}`);
        }

        // Send reaction
        await client.sendMessage(m.chat, {
            react: {
                text: reactionEmoji,
                key: m.key
            }
        });
        
        console.log(`✅ Reacted with ${reactionEmoji} to message from ${m.sender}`);
        
    } catch (error) {
        console.error('❌ Error in auto reaction:', error);
    }
};

module.exports = {
    areact,
    handleAutoReact
};
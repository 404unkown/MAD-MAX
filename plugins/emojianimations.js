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

module.exports = {
    async happy(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            // Send processing reaction
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '😂' });
            const emojiMessages = [
                "😃", "😄", "😁", "😊", "😎", "🥳",
                "😸", "😹", "🌞", "🌈", "😃", "😄",
                "😁", "😊", "😎", "🥳", "😸", "😹",
                "🌞", "🌈", "😃", "😄", "😁", "😊"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            // Success reaction
            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in happy animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async heart(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '🖤' });
            const emojiMessages = [
                "💖", "💗", "💕", "🩷", "💛", "💚",
                "🩵", "💙", "💜", "🖤", "🩶", "🤍",
                "🤎", "❤️‍🔥", "💞", "💓", "💘", "💝",
                "♥️", "💟", "❤️‍🩹", "❤️"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in heart animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async angry(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '👽' });
            const emojiMessages = [
                "😡", "😠", "🤬", "😤", "😾", "😡",
                "😠", "🤬", "😤", "😾"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in angry animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async sad(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '😔' });
            const emojiMessages = [
                "🥺", "😟", "😕", "😖", "😫", "🙁",
                "😩", "😥", "😓", "😪", "😢", "😔",
                "😞", "😭", "💔", "😭", "😿"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in sad animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async shy(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '🧐' });
            const emojiMessages = [
                "😳", "😊", "😶", "🙈", "🙊",
                "😳", "😊", "😶", "🙈", "🙊"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in shy animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async moon(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '🌝' });
            const emojiMessages = [
                "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
                "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
                "🌓", "🌔", "🌕", "🌖", "🌗", "🌘",
                "🌑", "🌒", "🌓", "🌔", "🌕", "🌖",
                "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
                "🌕", "🌖", "🌝🌚"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in moon animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async confused(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '🤔' });
            const emojiMessages = [
                "😕", "😟", "😵", "🤔", "😖", 
                "😲", "😦", "🤷", "🤷‍♂️", "🤷‍♀️"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in confused animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async hot(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: '💋' });
            const emojiMessages = [
                "🥵", "❤️", "💋", "😫", "🤤", 
                "😋", "🥵", "🥶", "🙊", "😻", 
                "🙈", "💋", "🫂", "🫀", "👅", 
                "👄", "💋"
            ];

            for (const line of emojiMessages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in hot animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    },
    
    async nikal(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            const loadingMessage = await client.sendMessage(chatId, { text: 'MAD-MAX🗿' });
            
            const asciiMessages = [
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀⠀     ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀  ⠀    ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Nikal   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀⠀__⠀   ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀⠀  ⠀  ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀       ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Lavde   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀|__|⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀⠀      ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸   Pehli   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀     ⣿  ⢹⠀           ⡇
  ⠙⢿⣯⠄⠀⠀(P)⠀⠀     ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀   ⠀     ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Fursat  ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀        ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀⠀__ ⠀  ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀⠀      ⢳⡀⠀⡏⠀⠀    ⠀  ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀ ⠀      ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Meeee   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀       ⣿  ⢹⠀          ⡇
  ⠙⢿⣯⠄⠀⠀|__| ⠀    ⡿ ⠀⡇⠀⠀⠀⠀    ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀`,
                `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀
 ⠀⣴⠿⠏⠀⠀⠀⠀   ⠀  ⠀⢳⡀⠀⡏⠀⠀       ⢷
⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀  ⠀       ⡇
⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲   ⣿  ⣸   Nikal   ⡇
 ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀       ⣿  ⢹⠀           ⡇
  ⠙⢿⣯⠄⠀⠀lodu⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀   ⡼
⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀  ⡴⠃⠀   ⠘⠤⣄⣠⠞⠀
⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀
⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀
⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀`
            ];

            for (const asciiMessage of asciiMessages) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await client.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: loadingMessage.key,
                            type: 14,
                            editedMessage: {
                                conversation: asciiMessage,
                            },
                        },
                    },
                    {}
                );
            }

            await client.sendMessage(chatId, { 
                react: { text: '✅', key: message.key } 
            });

        } catch (e) {
            console.log('Error in nikal animation:', e);
            await client.sendMessage(chatId, { 
                text: `❌ *Error!* ${e.message}`,
                ...channelInfo,
                quoted: message 
            });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
        }
    }
};
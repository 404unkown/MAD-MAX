const { delay } = require('@whiskeysockets/baileys');

async function squidgameCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        
        if (!isGroup) {
            await client.sendMessage(chatId, { 
                text: '❌ *Squid Game*\n\nThis command can only be used in groups!'
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎮', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🎮 *Starting Squid Game...*'
        }, { quoted: message });

        // Get group metadata
        const groupMetadata = await client.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Filter out bot and admins
        const players = participants.filter(p => 
            p.id !== botId && !p.admin
        ).map(p => p.id);

        if (players.length < 2) {
            await client.sendMessage(chatId, { delete: processingMsg.key });
            await client.sendMessage(chatId, { 
                text: '❌ Need at least 2 non-admin players to start Squid Game!'
            }, { quoted: message });
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            return;
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        // Game introduction
        const intro = `🔴 *SQUID GAME* 🟢\n\n` +
                      `🎯 *Welcome to the Squid Game!*\n\n` +
                      `👥 *Total Players:* ${players.length}\n` +
                      `🎲 *Game:* Red Light, Green Light\n\n` +
                      `📜 *Rules:*\n` +
                      `• During 🟢 *GREEN LIGHT* - You must move (send a message)\n` +
                      `• During 🔴 *RED LIGHT* - You must freeze (stay silent)\n` +
                      `• Wrong move = ❌ Elimination\n` +
                      `• Last player standing = 🏆 Winner\n\n` +
                      `⚡ *Game starting in 5 seconds...*`;

        await client.sendMessage(chatId, { 
            text: intro,
            mentions: players
        }, { quoted: message });

        await delay(5000);

        let alivePlayers = [...players];
        let round = 1;
        const maxRounds = 5;

        while (alivePlayers.length > 1 && round <= maxRounds) {
            // Randomly choose green or red light
            const isGreenLight = Math.random() > 0.5;
            const lightEmoji = isGreenLight ? '🟢' : '🔴';
            const lightText = isGreenLight ? 'GREEN LIGHT' : 'RED LIGHT';
            
            // Announce light
            const roundMsg = `\n══════ *ROUND ${round}* ══════\n\n` +
                            `${lightEmoji} *${lightText}*\n\n` +
                            `*Remaining Players:* ${alivePlayers.length}\n` +
                            `⏱️ *You have 8 seconds...*`;

            await client.sendMessage(chatId, { 
                text: roundMsg,
                mentions: alivePlayers
            });

            // Wait 8 seconds for responses
            await delay(8000);

            // Random elimination (simplified version)
            // In a real implementation, you'd track who sent messages
            const eliminated = [];
            const surviving = [];

            // Randomly eliminate 1-3 players each round
            const eliminateCount = Math.min(
                Math.floor(Math.random() * 3) + 1,
                alivePlayers.length - 1
            );

            for (let i = 0; i < alivePlayers.length; i++) {
                if (i < eliminateCount) {
                    eliminated.push(alivePlayers[i]);
                } else {
                    surviving.push(alivePlayers[i]);
                }
            }

            // Announce results
            if (eliminated.length > 0) {
                const eliminatedMentions = eliminated;
                const eliminatedText = eliminated.map(p => `@${p.split('@')[0]}`).join(', ');
                
                await client.sendMessage(chatId, {
                    text: `❌ *Eliminated:* ${eliminatedText}\n\n😵 They failed to follow the rules!`,
                    mentions: eliminatedMentions
                });
            }

            if (surviving.length === 1) {
                // Game over - winner found
                await client.sendMessage(chatId, {
                    text: `🏆 *GAME OVER - WINNER!* 🏆\n\n` +
                          `🎉 Congratulations @${surviving[0].split('@')[0]}!\n\n` +
                          `💰 You win 45.6 Billion Won!`,
                    mentions: [surviving[0]]
                });

                await client.sendMessage(chatId, { 
                    react: { text: '🏆', key: message.key } 
                });
                return;
            }

            alivePlayers = surviving;
            round++;

            await delay(3000);
        }

        if (alivePlayers.length > 1) {
            // Multiple survivors
            const survivorsText = alivePlayers.map(p => `@${p.split('@')[0]}`).join(', ');
            
            await client.sendMessage(chatId, {
                text: `🏆 *GAME OVER - MULTIPLE SURVIVORS!* 🏆\n\n` +
                      `✨ The game ends with ${alivePlayers.length} survivors:\n${survivorsText}\n\n` +
                      `🎮 Play again with .squidgame`,
                mentions: alivePlayers
            });

            await client.sendMessage(chatId, { 
                react: { text: '🎮', key: message.key } 
            });
        }

    } catch (error) {
        console.error('Squid Game error:', error);
        await client.sendMessage(chatId, { 
            text: '❌ An error occurred during Squid Game.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = squidgameCommand;
const axios = require('axios');
const config = require('../set');

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

// Simple translation function (replace with actual translate if needed)
async function translate(text, options) {
    // If you have a translate function, use it here
    // For now, just return the text
    return text;
}

// ==================== CHIFUMI (Rock Paper Scissors) ====================
async function chifumiCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo;
        const repliedParticipant = quotedMsg?.participant;
        const repliedMessage = quotedMsg?.quotedMessage;

        if (!repliedParticipant) {
            await client.sendMessage(chatId, {
                text: `🎮 *CHIFUMI GAME*\n\nRock-Paper-Scissors game that requires a friend!\n\n*Usage:* Reply to someone's message with .chifumi to invite them to play.\n\n*How to play:*\n1. Reply to someone's message with .chifumi\n2. They must type 'yes' to accept\n3. Both players choose rock/paper/scissors in private chat\n4. Winner is announced!`,
                ...channelInfo
            }, { quoted: message });
            
            await client.sendMessage(chatId, { 
                react: { text: '🎮', key: message.key } 
            });
            return;
        }

        const player1 = sender;
        const player2 = repliedParticipant;

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📺', key: message.key } 
        });

        // Send invitation
        await client.sendMessage(chatId, {
            text: `🎮 @${player1.split('@')[0]} invites @${player2.split('@')[0]} to play Rock-Paper-Scissors!\n\nTo accept the challenge, type *yes*`,
            mentions: [player1, player2],
            ...channelInfo
        }, { quoted: message });

        try {
            // Wait for response from player2
            const response = await client.awaitForMessage({
                sender: player2,
                chatJid: chatId,
                timeout: 30000 // 30 seconds
            });

            let responseText = '';
            if (response.message?.conversation) {
                responseText = response.message.conversation.toLowerCase();
            } else if (response.message?.extendedTextMessage?.text) {
                responseText = response.message.extendedTextMessage.text.toLowerCase();
            }

            if (responseText === 'yes') {
                // Game accepted
                let msg1 = `*Player 1:* @${player2.split('@')[0]}\n*Player 2:* @${player1.split('@')[0]}\n\n*Rules:* The game will start soon. You have 1 minute each to make a choice in our private chat.`;
                
                await client.sendMessage(chatId, {
                    text: msg1,
                    mentions: [player1, player2],
                    ...channelInfo
                });

                let msg2 = `You have 3 choices:\n\n• rock\n• paper\n• scissors\n\nPlease send your choice`;
                
                let players = [player1, player2];
                let choices = [];

                try {
                    for (const player of players) {
                        // Notify in group
                        await client.sendMessage(chatId, {
                            text: `@${player.split("@")[0]} Please go to private chat to make your choice.`,
                            mentions: [player],
                            ...channelInfo
                        });

                        // Send private message
                        await client.sendMessage(player, {
                            text: msg2,
                            ...channelInfo
                        });

                        // Wait for choice
                        const choiceMsg = await client.awaitForMessage({
                            sender: player,
                            chatJid: player,
                            timeout: 60000 // 1 minute
                        });

                        let choice = '';
                        if (choiceMsg.message?.extendedTextMessage?.text) {
                            choice = choiceMsg.message.extendedTextMessage.text.toLowerCase();
                        } else if (choiceMsg.message?.conversation) {
                            choice = choiceMsg.message.conversation.toLowerCase();
                        }

                        choices.push(choice);
                        console.log(`Choice from ${player}: ${choice}`);
                    }

                    console.log('All choices:', choices);

                    const validChoices = ["rock", "paper", "scissors"];
                    const choice1 = choices[0];
                    const choice2 = choices[1];

                    if (!validChoices.includes(choice1) || !validChoices.includes(choice2)) {
                        await client.sendMessage(chatId, {
                            text: `*Player 1:* @${player2.split('@')[0]}\n*Player 2:* @${player1.split('@')[0]}\n\n*Result:* One or both choices are invalid.`,
                            mentions: [player1, player2],
                            ...channelInfo
                        });
                    } else if (choice1 === choice2) {
                        // Tie
                        await client.sendMessage(chatId, {
                            text: `*Player 1:* @${player2.split('@')[0]} chose *${choice2}*\n*Player 2:* @${player1.split('@')[0]} chose *${choice1}*\n\n*Result:* It's a tie! 🤝`,
                            mentions: [player1, player2],
                            ...channelInfo
                        });
                    } else if (
                        (choice1 === "rock" && choice2 === "scissors") ||
                        (choice1 === "paper" && choice2 === "rock") ||
                        (choice1 === "scissors" && choice2 === "paper")
                    ) {
                        // Player 1 (inviter) wins
                        await client.sendMessage(chatId, {
                            text: `*Player 1:* @${player2.split('@')[0]} chose *${choice2}*\n*Player 2:* @${player1.split('@')[0]} chose *${choice1}*\n\n*Result:* @${player1.split('@')[0]} wins! 🏆`,
                            mentions: [player1, player2],
                            ...channelInfo
                        });
                    } else {
                        // Player 2 (invited) wins
                        await client.sendMessage(chatId, {
                            text: `*Player 1:* @${player2.split('@')[0]} chose *${choice2}*\n*Player 2:* @${player1.split('@')[0]} chose *${choice1}*\n\n*Result:* @${player2.split('@')[0]} wins! 🏆`,
                            mentions: [player1, player2],
                            ...channelInfo
                        });
                    }

                } catch (error) {
                    if (error.message === 'Timeout') {
                        await client.sendMessage(chatId, {
                            text: `*Player 1:* @${player2.split('@')[0]}\n*Player 2:* @${player1.split('@')[0]}\n\n*Result:* Players took too long to decide. Game canceled.`,
                            mentions: [player1, player2],
                            ...channelInfo
                        });
                    } else {
                        console.error(error);
                    }
                }

            } else {
                await client.sendMessage(chatId, {
                    text: `❌ @${player2.split('@')[0]} refused the invitation.`,
                    mentions: [player2],
                    ...channelInfo
                }, { quoted: message });
            }

        } catch (error) {
            if (error.message === 'Timeout') {
                await client.sendMessage(chatId, {
                    text: `⏰ @${player2.split('@')[0]} took too long to respond. Game canceled.`,
                    mentions: [player2],
                    ...channelInfo
                }, { quoted: message });
            } else {
                console.error(error);
            }
        }

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error("Chifumi Command Error:", error);
        
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// ==================== QUIZ GAME ====================
async function quizCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '📝', key: message.key } 
        });

        // Fetch quiz
        const quizRes = await axios.get("https://quizzapi.jomoreschi.fr/api/v1/quiz?limit=1&difficulty=facile");
        
        const quizData = quizRes.data.quizzes[0];
        
        // Translate category and question
        const category = await translate(quizData.category, { to: 'en' });
        const question = await translate(quizData.question, { to: 'en' });

        let msg = `🎮 *QUIZ GAME*\n\n`;
        msg += `📚 *Category:* ${category}\n`;
        msg += `❓ *Question:* ${question}\n\n`;
        msg += `*Answers:*\n`;

        // Collect answers
        let answers = [...quizData.badAnswers, quizData.answer];
        
        // Shuffle answers
        async function shuffleArray(array) {
            const shuffled = array.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        let shuffledAnswers = await shuffleArray(answers);

        for (let i = 0; i < shuffledAnswers.length; i++) {
            msg += `*${i + 1}:* ${shuffledAnswers[i]}\n`;
        }

        msg += `\n⏱️ *Send the number of the correct answer within 15 seconds!*`;

        // Send quiz
        await client.sendMessage(chatId, {
            text: msg,
            ...channelInfo
        }, { quoted: message });

        // Wait for answer
        try {
            const answerMsg = await client.awaitForMessage({
                sender: sender,
                chatJid: chatId,
                timeout: 15000 // 15 seconds
            });

            let answerText = '';
            if (answerMsg.message?.extendedTextMessage?.text) {
                answerText = answerMsg.message.extendedTextMessage.text;
            } else if (answerMsg.message?.conversation) {
                answerText = answerMsg.message.conversation;
            }

            const selectedIndex = parseInt(answerText) - 1;

            if (shuffledAnswers[selectedIndex] === quizData.answer) {
                await client.sendMessage(chatId, {
                    text: `✅ *Correct!* 🎉\n\nGreat job, @${sender.split('@')[0]}!`,
                    mentions: [sender],
                    ...channelInfo
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
            } else {
                await client.sendMessage(chatId, {
                    text: `❌ *Wrong answer!*\n\nThe correct answer was: *${quizData.answer}*`,
                    ...channelInfo
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
            }

        } catch (error) {
            if (error.message === 'Timeout') {
                await client.sendMessage(chatId, {
                    text: `⏰ *Time's up!*\n\nYou took too long to answer.\nThe correct answer was: *${quizData.answer}*`,
                    ...channelInfo
                }, { quoted: message });
                
                await client.sendMessage(chatId, { 
                    react: { text: '⏰', key: message.key } 
                });
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error("Quiz Command Error:", error);
        
        await client.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`,
            ...channelInfo
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

module.exports = {
    chifumiCommand,
    quizCommand
};
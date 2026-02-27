const fs = require('fs');

const words = ['javascript', 'bot', 'hangman', 'whatsapp', 'nodejs', 'python', 'telegram', 'discord', 'programming', 'developer'];
let hangmanGames = {};

async function startHangman(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if game already exists
        if (hangmanGames[chatId]) {
            await client.sendMessage(chatId, { 
                text: '🎮 *Hangman Game*\n\nA game is already in progress in this chat! Use letters to guess.' 
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎮', key: message.key } 
        });

        const word = words[Math.floor(Math.random() * words.length)];
        const maskedWord = '_ '.repeat(word.length).trim();

        hangmanGames[chatId] = {
            word,
            maskedWord: maskedWord.split(' '),
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
            player: sender,
            playerName: pushName
        };

        const gameMessage = `🎮 *Hangman Game Started!* 🎮\n\n` +
                           `📝 *Word:* ${maskedWord}\n` +
                           `💀 *Wrong Guesses:* 0/${hangmanGames[chatId].maxWrongGuesses}\n` +
                           `👤 *Player:* @${sender.split('@')[0]}\n\n` +
                           `_Guess a letter by just typing it!_`;

        await client.sendMessage(chatId, { 
            text: gameMessage,
            mentions: [sender]
        }, { quoted: message });

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });

    } catch (error) {
        console.error('Error starting hangman:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to start hangman game. Try again later.' 
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

async function guessLetter(client, chatId, message, letter, sender) {
    try {
        if (!hangmanGames[chatId]) {
            return false; // No game in progress
        }

        const game = hangmanGames[chatId];
        const { word, guessedLetters, maskedWord, maxWrongGuesses, player } = game;

        // Check if the guesser is the player
        if (sender !== player) {
            await client.sendMessage(chatId, { 
                text: `❌ Only @${player.split('@')[0]} can guess in this game!` 
            }, { quoted: message });
            return true;
        }

        // Validate input (single letter)
        if (letter.length !== 1 || !letter.match(/[a-z]/i)) {
            await client.sendMessage(chatId, { 
                text: '❌ Please guess a single letter (A-Z)!' 
            }, { quoted: message });
            return true;
        }

        const lowerLetter = letter.toLowerCase();

        if (guessedLetters.includes(lowerLetter)) {
            await client.sendMessage(chatId, { 
                text: `⚠️ You already guessed "${letter}". Try another letter.` 
            }, { quoted: message });
            return true;
        }

        guessedLetters.push(lowerLetter);

        let responseText = '';
        let gameOver = false;

        if (word.includes(lowerLetter)) {
            // Correct guess
            for (let i = 0; i < word.length; i++) {
                if (word[i] === lowerLetter) {
                    maskedWord[i] = lowerLetter;
                }
            }

            const currentWord = maskedWord.join(' ');
            responseText = `✅ *Correct guess!*\n\n📝 *Word:* ${currentWord}\n🔤 *Guessed:* ${guessedLetters.join(', ')}`;

            if (!maskedWord.includes('_')) {
                // Game won
                responseText = `🎉 *Congratulations!* 🎉\n\nYou guessed the word: *${word}*\n\n🏆 *Winner:* @${sender.split('@')[0]}`;
                delete hangmanGames[chatId];
                gameOver = true;
            }
        } else {
            // Wrong guess
            game.wrongGuesses += 1;
            const remaining = maxWrongGuesses - game.wrongGuesses;
            
            responseText = `❌ *Wrong guess!*\n\n💀 *Wrong guesses:* ${game.wrongGuesses}/${maxWrongGuesses}\n🔤 *Guessed:* ${guessedLetters.join(', ')}`;

            if (game.wrongGuesses >= maxWrongGuesses) {
                // Game lost
                responseText = `💀 *Game Over!* 💀\n\nThe word was: *${word}*\n\nBetter luck next time, @${sender.split('@')[0]}!`;
                delete hangmanGames[chatId];
                gameOver = true;
            } else {
                responseText += `\n⏳ *Tries left:* ${remaining}`;
            }
        }

        // Add hangman art based on wrong guesses
        if (!gameOver) {
            responseText += `\n\n${getHangmanArt(game.wrongGuesses)}`;
        }

        await client.sendMessage(chatId, { 
            text: responseText,
            mentions: gameOver ? [sender] : []
        }, { quoted: message });

        return true;

    } catch (error) {
        console.error('Error in hangman guess:', error);
        return false;
    }
}

function getHangmanArt(wrongGuesses) {
    const stages = [
        '```\n  +---+\n      |\n      |\n      |\n      |\n      |\n=========```',
        '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
        '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
        '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
        '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```'
    ];
    
    return stages[Math.min(wrongGuesses, stages.length - 1)] || stages[0];
}

function isHangmanGameActive(chatId) {
    return !!hangmanGames[chatId];
}

module.exports = { 
    startHangman, 
    guessLetter,
    isHangmanGameActive 
};
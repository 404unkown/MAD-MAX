const fs = require('fs');
const path = require('path');

// Extended word list
const words = [
    'javascript', 'bot', 'hangman', 'whatsapp', 'nodejs', 'python', 'developer',
    'programming', 'computer', 'internet', 'server', 'database', 'function',
    'variable', 'array', 'object', 'string', 'number', 'boolean', 'loop',
    'condition', 'statement', 'expression', 'operator', 'console', 'browser',
    'mobile', 'application', 'software', 'hardware', 'network', 'protocol',
    'router', 'switch', 'firewall', 'security', 'encryption', 'password',
    'username', 'email', 'message', 'chat', 'group', 'sticker', 'image',
    'video', 'audio', 'document', 'download', 'upload', 'stream', 'buffer',
    'callback', 'promise', 'async', 'await', 'module', 'package', 'library',
    'framework', 'react', 'vue', 'angular', 'express', 'mongodb', 'mysql'
];

let hangmanGames = {};

// Helper function to get game state display
function getHangmanDisplay(wrongGuesses) {
    const stages = [
        '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========\n```',
        '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========\n```'
    ];
    return stages[Math.min(wrongGuesses, stages.length - 1)];
}

const startHangman = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Check if game already exists
        if (hangmanGames[chatId]) {
            return await client.sendMessage(chatId, { 
                text: '🎮 *A game is already in progress!*\n\nUse letters to guess or type *.endhangman* to end the game.' 
            }, { quoted: m });
        }

        // Get word based on difficulty or random
        let wordList = words;
        let difficulty = args[0]?.toLowerCase();
        
        if (difficulty === 'easy') {
            wordList = words.filter(w => w.length <= 5);
        } else if (difficulty === 'medium') {
            wordList = words.filter(w => w.length >= 6 && w.length <= 8);
        } else if (difficulty === 'hard') {
            wordList = words.filter(w => w.length >= 9);
        }

        const word = wordList[Math.floor(Math.random() * wordList.length)];
        const maskedWord = '_ '.repeat(word.length).trim();

        hangmanGames[chatId] = {
            word: word.toLowerCase(),
            maskedWord: maskedWord.split(' '),
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
            players: [sender],
            currentPlayer: sender,
            gameStarted: Date.now()
        };

        const hangmanDisplay = getHangmanDisplay(0);
        
        await client.sendMessage(chatId, { 
            text: `🎮 *HANGMAN GAME STARTED!*\n\n${hangmanDisplay}\n\n📝 *Word:* ${maskedWord}\n🎯 *Difficulty:* ${difficulty || 'random'}\n💡 *Guessed letters:* None\n❤️ *Tries left:* 6\n\n_Send a letter to guess!_` 
        }, { quoted: m });

    } catch (error) {
        console.error('Error starting hangman:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to start hangman game.' 
        }, { quoted: m });
    }
};

const guessLetter = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        if (!hangmanGames[chatId]) {
            return;
        }

        const letter = args[0]?.toLowerCase();
        
        if (!letter || letter.length !== 1 || !/[a-z]/.test(letter)) {
            await client.sendMessage(chatId, { 
                text: '❌ Please send a *single letter* (A-Z) to guess!' 
            }, { quoted: m });
            return;
        }

        const game = hangmanGames[chatId];
        const { word, guessedLetters, maskedWord, maxWrongGuesses, wrongGuesses } = game;

        // Check if letter was already guessed
        if (guessedLetters.includes(letter)) {
            await client.sendMessage(chatId, { 
                text: `⚠️ You already guessed "${letter}". Try another letter.\n\n📝 *Guessed letters:* ${guessedLetters.join(', ')}` 
            }, { quoted: m });
            return;
        }

        // Add to guessed letters
        guessedLetters.push(letter);

        // Check if letter is in word
        if (word.includes(letter)) {
            // Update masked word
            for (let i = 0; i < word.length; i++) {
                if (word[i] === letter) {
                    maskedWord[i] = letter;
                }
            }

            const currentWord = maskedWord.join(' ');
            const hangmanDisplay = getHangmanDisplay(wrongGuesses);
            
            // Check if word is completely guessed
            if (!maskedWord.includes('_')) {
                await client.sendMessage(chatId, { 
                    text: `🎉 *CONGRATULATIONS!*\n\n${hangmanDisplay}\n\n✅ You guessed the word: *${word}*\n📝 Guessed letters: ${guessedLetters.join(', ')}\n❌ Wrong guesses: ${wrongGuesses}\n\n_Game ended!_` 
                }, { quoted: m });
                
                delete hangmanGames[chatId];
                return;
            }

            await client.sendMessage(chatId, { 
                text: `✅ *CORRECT!*\n\n${hangmanDisplay}\n\n📝 *Word:* ${currentWord}\n💡 *Guessed:* ${guessedLetters.join(', ')}\n❤️ *Tries left:* ${maxWrongGuesses - wrongGuesses}\n\n_Keep guessing!_` 
            }, { quoted: m });

        } else {
            // Wrong guess
            game.wrongGuesses += 1;
            const remainingTries = maxWrongGuesses - game.wrongGuesses;
            const hangmanDisplay = getHangmanDisplay(game.wrongGuesses);

            if (game.wrongGuesses >= maxWrongGuesses) {
                await client.sendMessage(chatId, { 
                    text: `💀 *GAME OVER!*\n\n${hangmanDisplay}\n\n❌ The word was: *${word}*\n📝 Guessed letters: ${guessedLetters.join(', ')}\n\n_Game ended!_` 
                }, { quoted: m });
                
                delete hangmanGames[chatId];
                return;
            }

            await client.sendMessage(chatId, { 
                text: `❌ *WRONG!*\n\n${hangmanDisplay}\n\n📝 *Word:* ${maskedWord.join(' ')}\n💡 *Guessed:* ${guessedLetters.join(', ')}\n❤️ *Tries left:* ${remainingTries}\n\n_Try another letter!_` 
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Error in hangman guess:', error);
    }
};

const endHangman = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        if (!hangmanGames[chatId]) {
            await client.sendMessage(chatId, { 
                text: '❌ No hangman game is currently active!' 
            }, { quoted: m });
            return;
        }

        const game = hangmanGames[chatId];
        const hangmanDisplay = getHangmanDisplay(game.wrongGuesses);
        
        await client.sendMessage(chatId, { 
            text: `🛑 *GAME ENDED*\n\n${hangmanDisplay}\n\n📝 The word was: *${game.word}*\n💡 Guessed letters: ${game.guessedLetters.join(', ')}\n❌ Wrong guesses: ${game.wrongGuesses}\n\n_Game ended by user!_` 
        }, { quoted: m });

        delete hangmanGames[chatId];

    } catch (error) {
        console.error('Error ending hangman:', error);
    }
};

const hangmanStatus = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        if (!hangmanGames[chatId]) {
            await client.sendMessage(chatId, { 
                text: '❌ No hangman game is currently active!\n\nStart one with *.hangman*' 
            }, { quoted: m });
            return;
        }

        const game = hangmanGames[chatId];
        const hangmanDisplay = getHangmanDisplay(game.wrongGuesses);
        const remainingTries = game.maxWrongGuesses - game.wrongGuesses;

        await client.sendMessage(chatId, { 
            text: `📊 *GAME STATUS*\n\n${hangmanDisplay}\n\n📝 *Word:* ${game.maskedWord.join(' ')}\n💡 *Guessed:* ${game.guessedLetters.join(', ') || 'None'}\n❤️ *Tries left:* ${remainingTries}\n⏱️ *Started:* ${Math.round((Date.now() - game.gameStarted) / 1000)}s ago` 
        }, { quoted: m });

    } catch (error) {
        console.error('Error getting hangman status:', error);
    }
};

module.exports = {
    startHangman,
    guessLetter,
    endHangman,
    hangmanStatus,
    isHangmanGameActive: (chatId) => !!hangmanGames[chatId]
};
const axios = require('axios');

let triviaGames = {};

async function startTrivia(client, chatId, message, args, sender, pushName, isOwner) {
    if (triviaGames[chatId]) {
        await client.sendMessage(chatId, { 
            text: '❌ A trivia game is already in progress!' 
        }, { quoted: message });
        return;
    }

    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const questionData = response.data.results[0];

        triviaGames[chatId] = {
            question: questionData.question,
            correctAnswer: questionData.correct_answer,
            options: [...questionData.incorrect_answers, questionData.correct_answer].sort(),
        };

        await client.sendMessage(chatId, {
            text: `🎮 *TRIVIA TIME*\n\n❓ *Question:* ${triviaGames[chatId].question}\n\n📋 *Options:*\n${triviaGames[chatId].options.map((opt, i) => `${i+1}. ${opt}`).join('\n')}\n\n💡 Reply with the number or text of your answer.`
        }, { quoted: message });

    } catch (error) {
        console.error('Trivia error:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Error fetching trivia question. Try again later.' 
        }, { quoted: message });
    }
}

async function answerTrivia(client, chatId, message, args, sender, pushName, isOwner) {
    const answer = args.join(' ').trim();
    
    if (!triviaGames[chatId]) {
        await client.sendMessage(chatId, { 
            text: '❌ No trivia game is in progress.' 
        }, { quoted: message });
        return;
    }

    const game = triviaGames[chatId];

    if (answer.toLowerCase() === game.correctAnswer.toLowerCase() || 
        game.options[parseInt(answer)-1]?.toLowerCase() === game.correctAnswer.toLowerCase()) {
        await client.sendMessage(chatId, { 
            text: `✅ *Correct!*\n\nThe answer is: ${game.correctAnswer}` 
        }, { quoted: message });
    } else {
        await client.sendMessage(chatId, { 
            text: `❌ *Wrong!*\n\nThe correct answer was: ${game.correctAnswer}` 
        }, { quoted: message });
    }

    delete triviaGames[chatId];
}

module.exports = { startTrivia, answerTrivia };
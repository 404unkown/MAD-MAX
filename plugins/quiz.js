const axios = require('axios');

// Store active quizzes by chat ID
const activeQuizzes = new Map();

// Shuffle an array in place
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function quizCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if there's already an active quiz in this chat
        if (activeQuizzes.has(chatId)) {
            await client.sendMessage(chatId, { 
                text: "🎯 There's already an active quiz in this chat! Please answer the current question first."
            }, { quoted: message });
            return;
        }

        // Send processing reaction
        await client.sendMessage(chatId, { 
            react: { text: '🎯', key: message.key } 
        });

        const processingMsg = await client.sendMessage(chatId, {
            text: '🎯 *Fetching a quiz question...*'
        }, { quoted: message });

        try {
            // Try to fetch a quiz question from the API
            const response = await axios.get('https://the-trivia-api.com/v2/questions?limit=1', {
                timeout: 10000
            });
            
            const questionData = response.data[0];

            if (questionData) {
                await handleApiQuiz(client, chatId, message, sender, questionData, processingMsg);
                return;
            }
        } catch (apiError) {
            console.log('API failed, using fallback quiz:', apiError.message);
        }

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });
        
        // Use fallback quiz if API fails
        await simpleQuiz(client, chatId, message, sender);

    } catch (error) {
        console.error('Error in quiz command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Failed to fetch quiz data. Please try again later.'
        }, { quoted: message });
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }
}

// Function to handle API-based quiz
async function handleApiQuiz(client, chatId, message, sender, questionData, processingMsg) {
    const { question, correctAnswer, incorrectAnswers, category, difficulty } = questionData;
    const options = [...incorrectAnswers, correctAnswer];
    shuffleArray(options);

    // Find the index of correct answer after shuffling
    const correctIndex = options.findIndex(opt => opt === correctAnswer);
    const correctLetter = String.fromCharCode(65 + correctIndex);

    // Store quiz data
    activeQuizzes.set(chatId, {
        correctAnswer,
        correctLetter,
        options,
        questionText: question.text,
        startTime: Date.now(),
        userId: sender
    });

    // Delete processing message
    await client.sendMessage(chatId, { delete: processingMsg.key });

    // Send the question and options to the user
    const optionsText = options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n');
    const quizMessage = `🎯 *Quiz Time!* 🎯

📝 *Category:* ${category || 'General'}
⚡ *Difficulty:* ${difficulty || 'Medium'}
❓ *Question:* ${question.text}

${optionsText}

⏰ *You have 20 seconds to answer!*
📝 *Reply with the letter (A, B, C, or D) of your choice.*

👤 *Quiz started by:* @${sender.split('@')[0]}`;

    await client.sendMessage(chatId, { 
        text: quizMessage,
        mentions: [sender]
    }, { quoted: message });

    // Set timeout to clear quiz after 20 seconds
    setTimeout(() => {
        if (activeQuizzes.has(chatId)) {
            const quizData = activeQuizzes.get(chatId);
            client.sendMessage(chatId, { 
                text: `⏰ *Time's up!*\n\n📝 *Question was:* ${quizData.questionText}\n✅ *Correct answer was:* ${quizData.correctLetter}. ${quizData.correctAnswer}`
            });
            activeQuizzes.delete(chatId);
        }
    }, 20000);
}

// Function to handle quiz answers
async function checkAnswer(client, chatId, sender, answer, message) {
    if (!activeQuizzes.has(chatId)) return false;

    const quizData = activeQuizzes.get(chatId);
    
    // Check if this user started the quiz
    if (quizData.userId !== sender) {
        return false;
    }

    // Check if answer is valid (A, B, C, D)
    const normalizedAnswer = answer.trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
        return false;
    }

    // Get the answer index
    const answerIndex = normalizedAnswer.charCodeAt(0) - 65;
    const userAnswer = quizData.options[answerIndex];
    const isCorrect = userAnswer === quizData.correctAnswer;

    // Clear the quiz
    activeQuizzes.delete(chatId);

    // Send result
    if (isCorrect) {
        await client.sendMessage(chatId, { 
            text: `🎉 *Correct!* 🎉\n\n✅ *Your answer:* ${normalizedAnswer}. ${userAnswer}\n✅ *Correct answer:* ${quizData.correctLetter}. ${quizData.correctAnswer}\n\n🏆 Well done!`
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: message.key } 
        });
    } else {
        await client.sendMessage(chatId, { 
            text: `❌ *Incorrect!* ❌\n\n❌ *Your answer:* ${normalizedAnswer}. ${userAnswer}\n✅ *Correct answer:* ${quizData.correctLetter}. ${quizData.correctAnswer}\n\nBetter luck next time!`
        }, { quoted: message });
        
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: message.key } 
        });
    }

    return true;
}

// Simple quiz without API (fallback)
async function simpleQuiz(client, chatId, message, sender) {
    const quizzes = [
        {
            question: "What is the largest planet in our solar system?",
            options: ["Earth", "Mars", "Jupiter", "Saturn"],
            correct: 2, // Jupiter
            category: "Science",
            difficulty: "Easy"
        },
        {
            question: "Which element has the chemical symbol 'Au'?",
            options: ["Silver", "Gold", "Iron", "Copper"],
            correct: 1, // Gold
            category: "Chemistry",
            difficulty: "Easy"
        },
        {
            question: "How many continents are there?",
            options: ["5", "6", "7", "8"],
            correct: 2, // 7
            category: "Geography",
            difficulty: "Easy"
        },
        {
            question: "What is the capital of Japan?",
            options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
            correct: 2, // Tokyo
            category: "Geography",
            difficulty: "Easy"
        },
        {
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
            correct: 1, // Shakespeare
            category: "Literature",
            difficulty: "Medium"
        }
    ];

    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    
    const optionsText = randomQuiz.options.map((option, index) => 
        `${String.fromCharCode(65 + index)}. ${option}`
    ).join('\n');
    
    const quizMessage = `🎯 *Quiz Time!* 🎯

📝 *Category:* ${randomQuiz.category}
⚡ *Difficulty:* ${randomQuiz.difficulty}
❓ *Question:* ${randomQuiz.question}

${optionsText}

⏰ *You have 20 seconds to answer!*
📝 *Reply with the letter (A, B, C, or D) of your choice.*

👤 *Quiz started by:* @${sender.split('@')[0]}`;

    await client.sendMessage(chatId, { 
        text: quizMessage,
        mentions: [sender]
    }, { quoted: message });

    // Store quiz data
    activeQuizzes.set(chatId, {
        correctAnswer: randomQuiz.options[randomQuiz.correct],
        correctLetter: String.fromCharCode(65 + randomQuiz.correct),
        options: randomQuiz.options,
        questionText: randomQuiz.question,
        startTime: Date.now(),
        userId: sender
    });

    // Set timeout
    setTimeout(() => {
        if (activeQuizzes.has(chatId)) {
            const quizData = activeQuizzes.get(chatId);
            client.sendMessage(chatId, { 
                text: `⏰ *Time's up!*\n\n✅ *Correct answer was:* ${quizData.correctLetter}. ${quizData.correctAnswer}`
            });
            activeQuizzes.delete(chatId);
        }
    }, 20000);
}

// Function to handle answer messages (to be called from main.js)
async function handleQuizAnswer(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    const answer = args.join(' ').trim();
    if (!answer) return false;
    
    return await checkAnswer(client, chatId, sender, answer, message);
}

module.exports = {
    quizCommand,
    handleQuizAnswer,
    activeQuizzes
};
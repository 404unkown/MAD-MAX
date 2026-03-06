const axios = require('axios');

const matchesCommand = async (client, chatId, m, args, sender, pushName, isOwner) => {
    try {
        // Send loading reaction
        await client.sendMessage(chatId, { 
            react: { text: '⚽', key: m.key } 
        });

        // Send processing message
        const processingMsg = await client.sendMessage(chatId, {
            text: `⚽ *FOOTBALL MATCHES*\n\nFetching today's matches from top European leagues...\n\nPlease wait.`
        }, { quoted: m });

        // Fetch data from all leagues
        const [plRes, laligaRes, bundesligaRes, serieARes, ligue1Res] = await Promise.all([
            axios.get('https://api.dreaded.site/api/matches/PL'),
            axios.get('https://api.dreaded.site/api/matches/PD'),
            axios.get('https://api.dreaded.site/api/matches/BL1'),
            axios.get('https://api.dreaded.site/api/matches/SA'),
            axios.get('https://api.dreaded.site/api/matches/FL1')
        ]);

        const pl = plRes.data.data;
        const laliga = laligaRes.data.data;
        const bundesliga = bundesligaRes.data.data;
        const serieA = serieARes.data.data;
        const ligue1 = ligue1Res.data.data;

        // Delete processing message
        await client.sendMessage(chatId, { delete: processingMsg.key });

        let message = `⚽ *TODAY'S FOOTBALL MATCHES*\n\n`;

        // Helper function to format league matches
        const formatLeagueMatches = (leagueData, leagueName, flag) => {
            if (typeof leagueData === 'string') {
                return `${flag} *${leagueName}:*\n${leagueData}\n\n`;
            } else if (Array.isArray(leagueData) && leagueData.length > 0) {
                let matches = leagueData.map(match => {
                    const { game, date, time } = match;
                    return `• *${game}*\n  📅 Date: ${date}\n  ⏰ Time: ${time} (EAT)`;
                }).join('\n\n');
                return `${flag} *${leagueName}:*\n\n${matches}\n\n`;
            } else {
                return `${flag} *${leagueName}:*\nNo matches scheduled\n\n`;
            }
        };

        // Add each league's matches
        message += formatLeagueMatches(pl, 'Premier League', '🇬🇧');
        message += formatLeagueMatches(laliga, 'La Liga', '🇪🇸');
        message += formatLeagueMatches(bundesliga, 'Bundesliga', '🇩🇪');
        message += formatLeagueMatches(serieA, 'Serie A', '🇮🇹');
        message += formatLeagueMatches(ligue1, 'Ligue 1', '🇫🇷');

        message += `\n📌 *Times are in East African Timezone (EAT)*\n\n─ MAD-MAX BOT`;

        // Success reaction
        await client.sendMessage(chatId, { 
            react: { text: '✅', key: m.key } 
        });

        // Check if message is too long
        if (message.length > 4000) {
            const chunks = message.match(/(.|[\r\n]){1,3500}/g) || [];
            
            for (let i = 0; i < chunks.length; i++) {
                await client.sendMessage(chatId, { 
                    text: i === 0 ? chunks[i] : `*Part ${i+1}/${chunks.length}*\n\n${chunks[i]}`
                }, { quoted: i === 0 ? m : null });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            await client.sendMessage(chatId, { 
                text: message
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Matches fetch error:', error);

        // Error reaction
        await client.sendMessage(chatId, { 
            react: { text: '❌', key: m.key } 
        });

        await client.sendMessage(chatId, {
            text: `⚽ *FOOTBALL MATCHES*\n\n❌ Something went wrong. Unable to fetch matches.\n\nError: ${error.message}`
        }, { quoted: m });
    }
};

module.exports = {
    matchesCommand
};
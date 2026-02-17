const TicTacToe = require('../lib/tictactoe');

const games = {};

async function tictactoeCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const text = args.join(' ');
        
        if (Object.values(games).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(sender)
        )) {
            await client.sendMessage(chatId, { 
                text: '❌ You are still in a game. Type *surrender* to quit.' 
            }, { quoted: message });
            return;
        }

        let room = Object.values(games).find(room => 
            room.state === 'WAITING' && 
            (text ? room.name === text : true)
        );

        if (room) {
            room.o = chatId;
            room.game.playerO = sender;
            room.state = 'PLAYING';

            const arr = room.game.render().map(v => ({
                'X': '❎',
                'O': '⭕',
                '1': '1️⃣',
                '2': '2️⃣',
                '3': '3️⃣',
                '4': '4️⃣',
                '5': '5️⃣',
                '6': '6️⃣',
                '7': '7️⃣',
                '8': '8️⃣',
                '9': '9️⃣',
            }[v]));

            const str = `🎮 *TIC-TAC-TOE*\n\n` +
                `Turn: @${room.game.currentTurn.split('@')[0]}\n\n` +
                `${arr.slice(0, 3).join('')}\n` +
                `${arr.slice(3, 6).join('')}\n` +
                `${arr.slice(6).join('')}\n\n` +
                `❎: @${room.game.playerX.split('@')[0]}\n` +
                `⭕: @${room.game.playerO.split('@')[0]}\n\n` +
                `Type a number (1-9) to make your move`;

            await client.sendMessage(room.x, { 
                text: str,
                mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
            });

        } else {
            room = {
                id: 'tictactoe-' + (+new Date),
                x: chatId,
                o: '',
                game: new TicTacToe(sender, 'o'),
                state: 'WAITING'
            };

            if (text) room.name = text;

            await client.sendMessage(chatId, { 
                text: `⏳ *Waiting for opponent*\nType \`.ttt ${text || ''}\` to join!`
            });

            games[room.id] = room;
        }

    } catch (error) {
        console.error('Error in tictactoe command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Error starting game. Please try again.' 
        }, { quoted: message });
    }
}

async function handleTicTacToeMove(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        const text = args.join(' ').toLowerCase();
        
        const room = Object.values(games).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(sender) && 
            room.state === 'PLAYING'
        );

        if (!room) return;

        const isSurrender = /^(surrender|give up)$/i.test(text);
        
        if (!isSurrender && !/^[1-9]$/.test(text)) return;

        if (sender !== room.game.currentTurn && !isSurrender) {
            await client.sendMessage(chatId, { 
                text: '❌ Not your turn!' 
            }, { quoted: message });
            return;
        }

        let ok = isSurrender ? true : room.game.turn(
            sender === room.game.playerO,
            parseInt(text) - 1
        );

        if (!ok) {
            await client.sendMessage(chatId, { 
                text: '❌ Invalid move! That position is already taken.' 
            }, { quoted: message });
            return;
        }

        let winner = room.game.winner;
        let isTie = room.game.turns === 9;

        const arr = room.game.render().map(v => ({
            'X': '❎',
            'O': '⭕',
            '1': '1️⃣',
            '2': '2️⃣',
            '3': '3️⃣',
            '4': '4️⃣',
            '5': '5️⃣',
            '6': '6️⃣',
            '7': '7️⃣',
            '8': '8️⃣',
            '9': '9️⃣',
        }[v]));

        if (isSurrender) {
            winner = sender === room.game.playerX ? room.game.playerO : room.game.playerX;
            
            await client.sendMessage(chatId, { 
                text: `🏳️ @${sender.split('@')[0]} surrendered! @${winner.split('@')[0]} wins!`,
                mentions: [sender, winner]
            }, { quoted: message });
            
            delete games[room.id];
            return;
        }

        let gameStatus;
        if (winner) {
            gameStatus = `🎉 @${winner.split('@')[0]} wins!`;
        } else if (isTie) {
            gameStatus = `🤝 Game ended in a draw!`;
        } else {
            gameStatus = `🎲 Turn: @${room.game.currentTurn.split('@')[0]}`;
        }

        const str = `🎮 *TIC-TAC-TOE*\n\n${gameStatus}\n\n` +
            `${arr.slice(0, 3).join('')}\n` +
            `${arr.slice(3, 6).join('')}\n` +
            `${arr.slice(6).join('')}\n\n` +
            `❎: @${room.game.playerX.split('@')[0]}\n` +
            `⭕: @${room.game.playerO.split('@')[0]}`;

        const mentions = [room.game.playerX, room.game.playerO];
        if (winner) mentions.push(winner);
        if (!winner && !isTie) mentions.push(room.game.currentTurn);

        await client.sendMessage(room.x, { 
            text: str,
            mentions: mentions
        }, { quoted: message });

        if (room.x !== room.o) {
            await client.sendMessage(room.o, { 
                text: str,
                mentions: mentions
            }, { quoted: message });
        }

        if (winner || isTie) {
            delete games[room.id];
        }

    } catch (error) {
        console.error('Error in tictactoe move:', error);
    }
}

module.exports = {
    tictactoeCommand,
    handleTicTacToeMove
};
const settings = require('../set');

async function ownerCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        const ownerNumber = set.owner || '254';
        const ownerName = set.ownerName || '😎';
        
        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;waid=${ownerNumber}:${ownerNumber}
END:VCARD
`;

        await client.sendMessage(chatId, {
            contacts: { 
                displayName: ownerName, 
                contacts: [{ vcard }] 
            }
        }, { quoted: message });

        // Send a text message as well with more info
        await client.sendMessage(chatId, {
            text: `👑 *Bot Owner*\n\n*Name:* ${ownerName}\n*Number:* ${ownerNumber}\n\n_Use the contact card above to save or message the owner!_`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in owner command:', error);
        await client.sendMessage(chatId, {
            text: '❌ Failed to fetch owner information.'
        }, { quoted: message });
    }
}

module.exports = ownerCommand;
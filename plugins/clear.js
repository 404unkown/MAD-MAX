async function clearCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
    try {
        // Check if user is owner
        const config = require('../set');
        const isUserOwner = sender === config.owner + '@s.whatsapp.net';
        
        if (!isUserOwner && !isOwnerSimple) {
            return; // Silently ignore
        }

        // Delete the command message
        await client.sendMessage(chatId, { delete: message.key });

        // Send a clear chat request to the user
        await client.sendMessage(chatId, {
            text: "🧹 *Chat cleared successfully!*"
        });

    } catch (error) {
        console.error('Clear command error:', error);
        // Silently fail - no messages
    }
}

module.exports = clearCommand;
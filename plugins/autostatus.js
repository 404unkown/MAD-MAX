const fs = require('fs');
const path = require('path');

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

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false, 
        reactOn: false 
    }, null, 2));
}

async function autoStatusCommand(client, chatId, message, args, sender, pushName, isOwner) {
    try {
        // Check if user is owner
        if (!isOwner) {
            await client.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner!',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Read current config
        let config = { enabled: false, reactOn: false };
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch {
            config = { enabled: false, reactOn: false };
        }

        // args is an array from main.js
        const command = args[0]?.toLowerCase();

        // If no arguments, show current status
        if (!command) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const reactStatus = config.reactOn ? '✅ Enabled' : '❌ Disabled';
            await client.sendMessage(chatId, { 
                text: `🔄 *AUTO STATUS SETTINGS*\n\n` +
                      `📱 *Auto Status View:* ${status}\n` +
                      `💫 *Status Reactions:* ${reactStatus}\n\n` +
                      `*Commands:*\n` +
                      `• .autostatus on - Enable auto status view\n` +
                      `• .autostatus off - Disable auto status view\n` +
                      `• .autostatus react on - Enable status reactions\n` +
                      `• .autostatus react off - Disable status reactions\n` +
                      `• .autostatus status - Check current settings`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (command === 'status') {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const reactStatus = config.reactOn ? '✅ Enabled' : '❌ Disabled';
            await client.sendMessage(chatId, { 
                text: `📊 *AUTO STATUS STATUS*\n\n` +
                      `📱 *Auto View:* ${status}\n` +
                      `💫 *Reactions:* ${reactStatus}`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await client.sendMessage(chatId, { 
                text: '✅ *AUTO STATUS ENABLED*\n\nBot will now automatically view all contact statuses.',
                ...channelInfo
            }, { quoted: message });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await client.sendMessage(chatId, { 
                text: '❌ *AUTO STATUS DISABLED*\n\nBot will no longer automatically view statuses.',
                ...channelInfo
            }, { quoted: message });
        } 
        else if (command === 'react') {
            // Handle react subcommand
            const reactCommand = args[1]?.toLowerCase();
            
            if (!reactCommand) {
                await client.sendMessage(chatId, { 
                    text: '❌ Please specify on/off for reactions!\nUse: .autostatus react on/off',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await client.sendMessage(chatId, { 
                    text: '💫 *STATUS REACTIONS ENABLED*\n\nBot will now react to status updates with 💚.',
                    ...channelInfo
                }, { quoted: message });
            } 
            else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await client.sendMessage(chatId, { 
                    text: '❌ *STATUS REACTIONS DISABLED*\n\nBot will no longer react to status updates.',
                    ...channelInfo
                }, { quoted: message });
            } 
            else {
                await client.sendMessage(chatId, { 
                    text: '❌ Invalid reaction command! Use: .autostatus react on/off',
                    ...channelInfo
                }, { quoted: message });
            }
        } 
        else {
            await client.sendMessage(chatId, { 
                text: '❌ *Invalid Command*\n\n' +
                      'Available commands:\n' +
                      '• `on` - Enable auto status view\n' +
                      '• `off` - Disable auto status view\n' +
                      '• `react on` - Enable status reactions\n' +
                      '• `react off` - Disable status reactions\n' +
                      '• `status` - Check current settings',
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await client.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto status!\n' + error.message,
            ...channelInfo
        }, { quoted: message });
    }
}

// Function to check if auto status is enabled
function isAutoStatusEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.enabled || false;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// Function to check if status reactions are enabled
function isStatusReactionEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.reactOn || false;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// Function to react to status using proper method
async function reactToStatus(client, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        // Use the proper relayMessage method for status reactions
        await client.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
    }
}

// Function to handle status updates
async function handleStatusUpdate(client, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle status from messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await client.readMessages([msg.key]);
                    
                    // React to status if enabled
                    await reactToStatus(client, msg.key);
                    
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, waiting before retrying...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await client.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        // Handle direct status updates
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await client.readMessages([status.key]);
                
                // React to status if enabled
                await reactToStatus(client, status.key);
                
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await client.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        // Handle status in reactions
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await client.readMessages([status.reaction.key]);
                
                // React to status if enabled
                await reactToStatus(client, status.reaction.key);
                
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await client.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};
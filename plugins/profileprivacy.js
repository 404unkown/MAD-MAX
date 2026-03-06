const fs = require('fs');
const path = require('path');
const { jidNormalizedUser } = require('@whiskeysockets/baileys');

const PROFILEPRIVACY_PATH = path.join(__dirname, '..', 'data', 'profileprivacy.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readState() {
    try {
        if (!fs.existsSync(PROFILEPRIVACY_PATH)) {
            return { enabled: false, setting: 'all' };
        }
        const raw = fs.readFileSync(PROFILEPRIVACY_PATH, 'utf8');
        return JSON.parse(raw || '{}');
    } catch {
        return { enabled: false, setting: 'all' };
    }
}

function writeState(data) {
    try {
        fs.writeFileSync(PROFILEPRIVACY_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing profileprivacy state:', error);
    }
}

/**
 * Apply privacy setting to WhatsApp
 * @param {Object} client - WhatsApp client
 * @param {string} setting - privacy setting (all, contacts, contact_blacklist, none)
 * @returns {Promise<boolean>} - Success status
 */
async function applyPrivacySetting(client, setting) {
    try {
        // Map our settings to WhatsApp's expected values
        const privacyMap = {
            'all': 'all',
            'contacts': 'contacts',
            'contact_blacklist': 'contact_blacklist',
            'none': 'none'
        };
        
        const whatsappSetting = privacyMap[setting] || 'all';
        
        // Update profile picture privacy
        await client.updateProfilePicturePrivacy(whatsappSetting);
        console.log(`✅ Profile picture privacy updated to: ${setting}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to update profile picture privacy:', error);
        return false;
    }
}

async function profileprivacyCommand(client, chatId, message, args, sender, pushName, isOwner) {
    // Check if user is owner
    if (!isOwner) {
        await client.sendMessage(chatId, { 
            text: '❌ Only bot owner can use this command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }
    
    const argStr = args.join(' ').trim();
    const [sub, ...rest] = argStr.split(' ');
    const state = readState();

    if (!sub || !['on', 'off', 'status', 'all', 'contacts', 'contact_blacklist', 'none'].includes(sub.toLowerCase())) {
        await client.sendMessage(chatId, { 
            text: '*PROFILE PICTURE PRIVACY (Owner Only)*\n\n' +
                  '▢ *.profileprivacy on* - Enable profile picture privacy control\n' +
                  '▢ *.profileprivacy off* - Disable auto privacy control\n' +
                  '▢ *.profileprivacy status* - Show current status\n' +
                  '▢ *.profileprivacy all* - Everyone can see profile pic\n' +
                  '▢ *.profileprivacy contacts* - Only contacts\n' +
                  '▢ *.profileprivacy contact_blacklist* - Contacts except blacklist\n' +
                  '▢ *.profileprivacy none* - Nobody can see profile pic\n\n' +
                  '_Note: "none" setting will hide your profile picture from everyone_',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'status') {
        await client.sendMessage(chatId, { 
            text: `🖼️ *PROFILE PICTURE PRIVACY STATUS*\n\n` +
                  `Enabled: *${state.enabled ? '✅ YES' : '❌ NO'}*\n` +
                  `Current Setting: *${state.setting || 'all'}*\n\n` +
                  `_Use commands above to change settings_`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'on') {
        state.enabled = true;
        writeState(state);
        
        // Apply current setting
        const success = await applyPrivacySetting(client, state.setting);
        
        await client.sendMessage(chatId, { 
            text: success ? 
                `✅ *Profile picture privacy control is now ENABLED*.\nCurrent setting: ${state.setting}` :
                `⚠️ *Profile picture privacy control enabled but failed to apply setting*.\nCurrent setting: ${state.setting}\n\nPlease try setting manually.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'off') {
        state.enabled = false;
        writeState(state);
        
        // Optionally revert to default (all) when disabling
        // Uncomment the next line if you want to revert to default when disabling
        // await applyPrivacySetting(client, 'all');
        
        await client.sendMessage(chatId, { 
            text: `❌ *Profile picture privacy control is now DISABLED*.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }

    // Handle setting changes
    const validSettings = ['all', 'contacts', 'contact_blacklist', 'none'];
    if (validSettings.includes(sub.toLowerCase())) {
        const newSetting = sub.toLowerCase();
        state.setting = newSetting;
        writeState(state);
        
        // Apply the new setting if enabled
        let success = true;
        if (state.enabled) {
            success = await applyPrivacySetting(client, newSetting);
        }
        
        let responseText = success ?
            `✅ *Profile picture privacy setting updated to*: ${newSetting}` :
            `⚠️ *Setting saved but failed to apply*: ${newSetting}\n\nPlease try again or check bot permissions.`;
        
        if (!state.enabled) {
            responseText += `\n\n_Note: Privacy control is disabled. Use ".profileprivacy on" to enable and apply._`;
        }
        
        await client.sendMessage(chatId, { 
            text: responseText,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: 'MAD-MAX',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        return;
    }
}

module.exports = { 
    profileprivacyCommand,
    readState,
    applyPrivacySetting // Export for potential use elsewhere
};
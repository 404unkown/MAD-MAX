const fs = require('fs');
const path = require('path');

module.exports = async (client, chatId, message, args, sender, pushName, isOwner) => {
    try {
        // Check if in group
        if (!chatId.endsWith('@g.us')) {
            await client.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
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

        // Get the poll text from args
        const pollText = args.join(' ').trim();
        
        // Check if there's any text after .poll
        if (!pollText) {
            await client.sendMessage(chatId, {
                text: '📊 *POLL COMMAND*\n\n*Usage:* .poll question;option1,option2,option3...\n\n*Examples:*\n.poll Best programming language?;JavaScript,Python,Java,C++\n.poll Favorite color?;Red,Blue,Green,Yellow\n\n*Note:* Maximum 12 options allowed',
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

        // Split question and options
        const parts = pollText.split(';');
        
        if (parts.length < 2) {
            await client.sendMessage(chatId, {
                text: '❌ *Invalid format!*\n\nUse: .poll question;option1,option2,option3...\n\n*Example:*\n.poll Best programming language?;JavaScript,Python,Java',
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

        const question = parts[0].trim();
        const optionsString = parts[1].trim();
        
        if (!question) {
            await client.sendMessage(chatId, {
                text: '❌ Please provide a question!',
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

        // Parse options
        const options = optionsString.split(',')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        // Validate options
        if (options.length < 2) {
            await client.sendMessage(chatId, {
                text: '❌ Please provide at least 2 options!',
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

        if (options.length > 12) {
            await client.sendMessage(chatId, {
                text: '❌ Maximum 12 options allowed!',
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

        // Send processing reaction
        await client.sendMessage(chatId, {
            react: { text: '⏳', key: message.key }
        });

        // Create the poll
        await client.sendMessage(chatId, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1, // Users can select only one option
                toAnnouncementGroup: true // Announce in group
            }
        });

        // Add success reaction
        await client.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

        console.log(`[POLL] Created poll in ${chatId}: "${question}" with ${options.length} options`);

    } catch (error) {
        console.error('❌ Error creating poll:', error);
        
        await client.sendMessage(chatId, {
            text: `❌ Failed to create poll: ${error.message}`,
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
        
        // Add error reaction
        await client.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
    }
};
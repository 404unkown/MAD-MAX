const isAdmin = require('../lib/isAdmin');

module.exports = {
    async requestlist(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            // Send processing reaction
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            // Check if group
            if (!chatId.endsWith('@g.us')) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            // Check admin status
            const adminStatus = await isAdmin(client, chatId, sender);
            
            if (!adminStatus.isSenderAdmin && !isOwner) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ Only group admins can use this command.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            if (!adminStatus.isBotAdmin) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ I need to be an admin to view join requests.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            // Get pending requests
            try {
                const requests = await client.groupRequestParticipantsList(chatId);
                
                if (!requests || requests.length === 0) {
                    await client.sendMessage(chatId, { 
                        react: { text: 'ℹ️', key: message.key } 
                    });
                    await client.sendMessage(chatId, { 
                        text: "ℹ️ No pending join requests.",
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401269012709@newsletter',
                                newsletterName: 'MAD-MAX',
                                serverMessageId: -1
                            }
                        },
                        quoted: message 
                    });
                    return;
                }

                let text = `╭─❖ *PENDING JOIN REQUESTS* ❖─\n│\n`;
                text += `├─ Total: ${requests.length}\n│\n`;
                
                requests.forEach((user, i) => {
                    const name = user.name || 'Unknown';
                    text += `├─ ${i+1}. @${user.jid.split('@')[0]}\n`;
                    text += `│  └─ Name: ${name}\n`;
                });
                
                text += `│\n╰─➤ _Use .acceptall or .rejectall to manage_`;

                await client.sendMessage(chatId, { 
                    react: { text: '✅', key: message.key } 
                });
                
                await client.sendMessage(chatId, {
                    text: text,
                    mentions: requests.map(u => u.jid),
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message
                });

            } catch (apiError) {
                console.error("Group requests API error:", apiError);
                await client.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "⚠️ Group request feature is not available in this WhatsApp version.\n\nPlease use WhatsApp's built-in group request management.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
            }

        } catch (error) {
            console.error("Request list error:", error);
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, { 
                text: "❌ Failed to fetch join requests.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                },
                quoted: message 
            });
        }
    },

    async acceptall(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            if (!chatId.endsWith('@g.us')) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            const adminStatus = await isAdmin(client, chatId, sender);
            
            if (!adminStatus.isSenderAdmin && !isOwner) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ Only group admins can use this command.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            if (!adminStatus.isBotAdmin) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ I need to be an admin to accept join requests.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            try {
                const requests = await client.groupRequestParticipantsList(chatId);
                
                if (!requests || requests.length === 0) {
                    await client.sendMessage(chatId, { 
                        react: { text: 'ℹ️', key: message.key } 
                    });
                    await client.sendMessage(chatId, { 
                        text: "ℹ️ No pending join requests to accept.",
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401269012709@newsletter',
                                newsletterName: 'MAD-MAX',
                                serverMessageId: -1
                            }
                        },
                        quoted: message 
                    });
                    return;
                }

                const jids = requests.map(u => u.jid);
                await client.groupRequestParticipantsUpdate(chatId, jids, "approve");
                
                await client.sendMessage(chatId, { 
                    react: { text: '👍', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: `✅ Successfully accepted ${requests.length} join request(s).`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });

            } catch (apiError) {
                console.error("Accept all API error:", apiError);
                await client.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "⚠️ Failed to accept requests. Make sure bot is admin and try again.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
            }

        } catch (error) {
            console.error("Accept all error:", error);
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, { 
                text: "❌ Failed to accept join requests.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                },
                quoted: message 
            });
        }
    },

    async rejectall(client, chatId, message, args, sender, pushName, isOwner) {
        try {
            await client.sendMessage(chatId, { 
                react: { text: '⏳', key: message.key } 
            });

            if (!chatId.endsWith('@g.us')) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ This command can only be used in groups.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            const adminStatus = await isAdmin(client, chatId, sender);
            
            if (!adminStatus.isSenderAdmin && !isOwner) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ Only group admins can use this command.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            if (!adminStatus.isBotAdmin) {
                await client.sendMessage(chatId, { 
                    react: { text: '❌', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "❌ I need to be an admin to reject join requests.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
                return;
            }

            try {
                const requests = await client.groupRequestParticipantsList(chatId);
                
                if (!requests || requests.length === 0) {
                    await client.sendMessage(chatId, { 
                        react: { text: 'ℹ️', key: message.key } 
                    });
                    await client.sendMessage(chatId, { 
                        text: "ℹ️ No pending join requests to reject.",
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363401269012709@newsletter',
                                newsletterName: 'MAD-MAX',
                                serverMessageId: -1
                            }
                        },
                        quoted: message 
                    });
                    return;
                }

                const jids = requests.map(u => u.jid);
                await client.groupRequestParticipantsUpdate(chatId, jids, "reject");
                
                await client.sendMessage(chatId, { 
                    react: { text: '👎', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: `✅ Successfully rejected ${requests.length} join request(s).`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });

            } catch (apiError) {
                console.error("Reject all API error:", apiError);
                await client.sendMessage(chatId, { 
                    react: { text: '⚠️', key: message.key } 
                });
                await client.sendMessage(chatId, { 
                    text: "⚠️ Failed to reject requests. Make sure bot is admin and try again.",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401269012709@newsletter',
                            newsletterName: 'MAD-MAX',
                            serverMessageId: -1
                        }
                    },
                    quoted: message 
                });
            }

        } catch (error) {
            console.error("Reject all error:", error);
            await client.sendMessage(chatId, { 
                react: { text: '❌', key: message.key } 
            });
            await client.sendMessage(chatId, { 
                text: "❌ Failed to reject join requests.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: 'MAD-MAX',
                        serverMessageId: -1
                    }
                },
                quoted: message 
            });
        }
    }
};
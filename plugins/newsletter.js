module.exports = async (client, chatId, message, args, sender, pushName, isOwner) => {
    try {
        // Get the query from args
        const query = args.join(' ').trim();
        
        if (!query) {
            return await client.sendMessage(chatId, {
                text: `📢 *NEWSLETTER INFO*\n\n❎ Please provide a WhatsApp Channel link or ID.\n\n📌 *Examples:*\n.newsletter https://whatsapp.com/channel/xxxxxxxxxx\n.newsletter 120363401269012709`,
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
        }

        // Try to extract ID from URL or use as direct ID
        let channelId = query;
        const match = query.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (match) {
            channelId = match[1];
        }

        let metadata;

        try {
            // Try to get channel info
            if (channelId.includes('@newsletter')) {
                metadata = await client.newsletterMetadata(channelId);
            } else {
                // Try with invite format
                try {
                    metadata = await client.newsletterMetadata("invite", channelId);
                } catch {
                    // Try as direct ID
                    metadata = await client.newsletterMetadata(`${channelId}@newsletter`);
                }
            }
        } catch (err) {
            console.error('Newsletter fetch error:', err);
            return await client.sendMessage(chatId, {
                text: "🚫 *Failed to fetch channel info.*\n\nMake sure the channel ID or link is correct and try again.",
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
        }

        if (!metadata?.id) {
            return await client.sendMessage(chatId, {
                text: "❌ *Channel not found or inaccessible.*",
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
        }

        // Format creation date
        let creationDate = "Unknown";
        if (metadata.creation_time) {
            creationDate = new Date(metadata.creation_time * 1000).toLocaleString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        const infoText = `╭─❖ *CHANNEL INFORMATION* ❖─
│
├─ *ID:* 
│  \`${metadata.id}\`
│
├─ *NAME:* 
│  ${metadata.name || 'Unknown'}
│
├─ *DESCRIPTION:* 
│  ${metadata.description || 'No description'}
│
├─ *FOLLOWERS:* 
│  ${metadata.subscribers?.toLocaleString() || '0'}
│
├─ *CREATED:* 
│  ${creationDate}
│
├─ *STATE:* 
│  ${metadata.state || 'Active'}
│
╰─➤ _Requested by: ${pushName}_`;

        // Try to get preview image
        if (metadata.preview || metadata.photo) {
            const imageUrl = metadata.preview || metadata.photo;
            await client.sendMessage(chatId, {
                image: { url: typeof imageUrl === 'string' ? imageUrl : `https://pps.whatsapp.net${imageUrl}` },
                caption: infoText,
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
        } else {
            await client.sendMessage(chatId, {
                text: infoText,
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
        }

    } catch (error) {
        console.error('❌ Newsletter Error:', error);
        await client.sendMessage(chatId, {
            text: "⚠️ *An unexpected error occurred while fetching the channel info.*\n\nPlease try again later.",
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
    }
};
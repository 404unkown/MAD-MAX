const fetch = require('node-fetch');

const BASE = 'https://shizoapi.onrender.com/api/pies';
const VALID_COUNTRIES = ['china', 'indonesia', 'japan', 'korea', 'hijab'];

async function fetchPiesImageBuffer(country) {
	const url = `${BASE}/${country}?apikey=shizo`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const contentType = res.headers.get('content-type') || '';
	if (!contentType.includes('image')) throw new Error('API did not return an image');
	return res.buffer();
}

async function piesCommand(client, chatId, message, args, sender, pushName, isOwnerSimple) {
	const sub = (args && args[0] ? args[0] : '').toLowerCase();
	
	if (!sub) {
		await client.sendMessage(chatId, { 
			text: `🍰 *Pies Image Command*\n\n*Usage:* .pies <country>\n\n*Available Countries:*\n${VALID_COUNTRIES.map(c => `• ${c}`).join('\n')}\n\n*Example:* .pies japan` 
		}, { quoted: message });
		return;
	}
	
	if (!VALID_COUNTRIES.includes(sub)) {
		await client.sendMessage(chatId, { 
			text: `❌ *Unsupported Country:* ${sub}\n\nPlease choose from:\n${VALID_COUNTRIES.map(c => `• ${c}`).join('\n')}` 
		}, { quoted: message });
		return;
	}

	try {
		// Send processing reaction
		await client.sendMessage(chatId, { 
			react: { text: '🍰', key: message.key } 
		});

		const processingMsg = await client.sendMessage(chatId, {
			text: `🍰 *Fetching pies image for:* ${sub}...`
		}, { quoted: message });

		const imageBuffer = await fetchPiesImageBuffer(sub);
		
		// Delete processing message
		await client.sendMessage(chatId, { delete: processingMsg.key });

		await client.sendMessage(
			chatId,
			{ 
				image: imageBuffer, 
				caption: `🍰 *Pies - ${sub}*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
				mentions: [sender]
			},
			{ quoted: message }
		);

		// Success reaction
		await client.sendMessage(chatId, { 
			react: { text: '✅', key: message.key } 
		});

	} catch (err) {
		console.error('Error in pies command:', err);
		await client.sendMessage(chatId, { 
			text: '❌ Failed to fetch image. Please try again.' 
		}, { quoted: message });
		await client.sendMessage(chatId, { 
			react: { text: '❌', key: message.key } 
		});
	}
}

async function piesAlias(client, chatId, message, args, sender, pushName, isOwnerSimple, country) {
	try {
		// Send processing reaction
		await client.sendMessage(chatId, { 
			react: { text: '🍰', key: message.key } 
		});

		const processingMsg = await client.sendMessage(chatId, {
			text: `🍰 *Fetching pies image for:* ${country}...`
		}, { quoted: message });

		const imageBuffer = await fetchPiesImageBuffer(country);
		
		// Delete processing message
		await client.sendMessage(chatId, { delete: processingMsg.key });

		await client.sendMessage(
			chatId,
			{ 
				image: imageBuffer, 
				caption: `🍰 *Pies - ${country}*\n\n👤 *Requested by:* @${sender.split('@')[0]}`,
				mentions: [sender]
			},
			{ quoted: message }
		);

		// Success reaction
		await client.sendMessage(chatId, { 
			react: { text: '✅', key: message.key } 
		});

	} catch (err) {
		console.error(`Error in pies alias (${country}) command:`, err);
		await client.sendMessage(chatId, { 
			text: '❌ Failed to fetch image. Please try again.' 
		}, { quoted: message });
		await client.sendMessage(chatId, { 
			react: { text: '❌', key: message.key } 
		});
	}
}

module.exports = { piesCommand, piesAlias, VALID_COUNTRIES };
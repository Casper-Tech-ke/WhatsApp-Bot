import axios from 'axios';

function getReply(payload) {
	const data = payload?.data || payload || {};
	const reply = data.reply || data.answer || data.response || data.message || data.result || data.text;
	return typeof reply === 'string' ? reply.trim() : reply == null ? '' : String(reply);
}

export function createAiCommand({ name, alias = [], description, endpoint }) {
	return {
		name,
		alias,
		description,
		category: 'ai',
		ownerOnly: false,

		async execute(xcasper, msg, args, prefix) {
			const chatId = msg.key.remoteJid;
			if (!args.length) {
				await xcasper.sendMessage(chatId, {
					text: `🤖 *${name.toUpperCase()} AI*\n\n📝 *Usage:* ${prefix}${name} [your message]\n💬 *Example:* ${prefix}${name} Hello\n\n> ${name}  ALICIAH | CASPER TECH`
				}, { quoted: msg });
				return;
			}

			const query = args.join(' ');
			await xcasper.sendPresenceUpdate('composing', chatId);
			try {
				const response = await axios.get(`https://apiz.xcasper.space/api/ai/${endpoint}`, {
					params: { query },
					timeout: 90000
				});
				const reply = getReply(response.data);
				if (!reply) throw new Error(response.data?.error || 'The AI service returned no response.');
				await xcasper.sendMessage(chatId, {
					text: `${reply}\n\n> ${name}  ALICIAH | CASPER TECH`
				}, { quoted: msg });
			} catch (error) {
				const detail = error.response?.data?.error || error.message;
				console.error(`${name} API Error:`, detail);
				await xcasper.sendMessage(chatId, {
					text: `❌ *${name} failed:* ${detail}\n\n> ${name}  ALICIAH | CASPER TECH`
				}, { quoted: msg });
			}
		}
	};
}

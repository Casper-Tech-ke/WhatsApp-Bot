import { getQuotedImageBuffer } from '../../lib/mediaHelpers.js';

export default {
    name: 'setpp',
    alias: ['setbotpp', 'setprofilepicture', 'setbotpicture'],
    description: 'Reply to an image to set the bot account profile picture.',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        const image = await getQuotedImageBuffer(msg);
        if (!image.ok) {
            return xcasper.sendMessage(chatId, {
                text: `❌ ${image.error}\n\n*Usage:* Reply to an image with \`${prefix}setpp\`.`
            }, { quoted: msg });
        }

        const botNumber = String(xcasper.user?.id || '')
            .split('@')[0]
            .split(':')[0]
            .replace(/\D/g, '');
        const botJid = botNumber ? `${botNumber}@s.whatsapp.net` : null;
        if (!botJid) {
            return xcasper.sendMessage(chatId, { text: '❌ Bot account identity is unavailable. Please try again.' }, { quoted: msg });
        }

        try {
            await xcasper.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });
            await xcasper.updateProfilePicture(botJid, image.buffer);
            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: '✅ Bot account profile picture updated.' }, { quoted: msg });
        } catch (error) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: `❌ Failed to update the bot picture: ${error.message}` }, { quoted: msg });
        }
    }
};
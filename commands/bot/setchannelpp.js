import { getQuotedImageBuffer } from '../../lib/mediaHelpers.js';
import { isChannelJid } from '../../lib/channelHelpers.js';

export default {
    name: 'setchannelpp',
    alias: ['setchannelpic', 'setchannelpicture', 'channelpp'],
    description: 'Reply to an image in a channel to update its profile picture.',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        if (!isChannelJid(chatId)) {
            return xcasper.sendMessage(chatId, {
                text: '❌ Run this command inside the channel whose picture you want to update.'
            }, { quoted: msg });
        }

        const image = await getQuotedImageBuffer(msg);
        if (!image.ok) {
            return xcasper.sendMessage(chatId, {
                text: `❌ ${image.error}\n\n*Usage:* Reply to an image with \`${prefix}setchannelpp\`.`
            }, { quoted: msg });
        }

        try {
            await xcasper.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });
            await xcasper.newsletterUpdatePicture(chatId, image.buffer);
            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: '✅ Channel profile picture updated.' }, { quoted: msg });
        } catch (error) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, {
                text: `❌ Failed to update the channel picture. Ensure this account is a channel admin.\n\n${error.message}`
            }, { quoted: msg });
        }
    }
};
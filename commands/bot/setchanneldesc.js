import { isChannelJid } from '../../lib/channelHelpers.js';

export default {
    name: 'setchanneldesc',
    alias: ['channeldesc', 'setcdesc', 'setnewsletterdesc'],
    description: 'Change the current channel description.',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        const description = args.join(' ').trim();
        if (!isChannelJid(chatId)) {
            return xcasper.sendMessage(chatId, { text: '❌ Run this command inside the channel you want to edit.' }, { quoted: msg });
        }
        if (!description) {
            return xcasper.sendMessage(chatId, {
                text: `❌ Please provide a channel description.\n\n*Usage:* \`${prefix}setchanneldesc Your channel description\``
            }, { quoted: msg });
        }

        try {
            await xcasper.newsletterUpdateDescription(chatId, description);
            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: '✅ Channel description updated.' }, { quoted: msg });
        } catch (error) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, {
                text: `❌ Failed to update the channel description. Ensure this account is a channel admin.\n\n${error.message}`
            }, { quoted: msg });
        }
    }
};
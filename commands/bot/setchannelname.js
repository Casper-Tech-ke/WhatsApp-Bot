import { isChannelJid } from '../../lib/channelHelpers.js';

export default {
    name: 'setchannelname',
    alias: ['channelname', 'setcname', 'setnewslettername'],
    description: 'Change the current channel name.',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        const name = args.join(' ').trim();
        if (!isChannelJid(chatId)) {
            return xcasper.sendMessage(chatId, { text: '❌ Run this command inside the channel you want to rename.' }, { quoted: msg });
        }
        if (!name) {
            return xcasper.sendMessage(chatId, {
                text: `❌ Please provide a channel name.\n\n*Usage:* \`${prefix}setchannelname New Channel Name\``
            }, { quoted: msg });
        }

        try {
            await xcasper.newsletterUpdateName(chatId, name);
            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: `✅ Channel name changed to *${name}*.` }, { quoted: msg });
        } catch (error) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, {
                text: `❌ Failed to update the channel name. Ensure this account is a channel admin.\n\n${error.message}`
            }, { quoted: msg });
        }
    }
};
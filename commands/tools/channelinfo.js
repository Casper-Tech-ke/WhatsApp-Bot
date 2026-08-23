import { channelDetails, resolveChannelTarget } from '../../lib/channelHelpers.js';

export default {
    name: 'channelinfo',
    alias: ['channeldata', 'chdata', 'newsletterinfo'],
    description: 'Get available information about a WhatsApp channel.',
    category: 'tools',

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        const target = await resolveChannelTarget(xcasper, chatId, args.join(' '));
        if (!target.jid) {
            return xcasper.sendMessage(chatId, {
                text: `❌ ${target.error}\n\n*Usage:* \`${prefix}channelinfo https://whatsapp.com/channel/XXXX\``
            }, { quoted: msg });
        }

        try {
            const metadata = target.metadata || await xcasper.newsletterMetadata('jid', target.jid);
            if (!metadata) {
                return xcasper.sendMessage(chatId, {
                    text: '❌ Channel data is unavailable. The channel may be private or no longer accessible.'
                }, { quoted: msg });
            }

            const details = channelDetails(metadata, target.jid);
            const lines = [
                '📢 *CHANNEL DATA*\n',
                `📛 *Name:* ${details.name}`,
                `🆔 *JID:* \`${details.jid}\``,
                `🔑 *Channel ID:* \`${details.jid.split('@')[0]}\``
            ];
            if (details.description) lines.push(`📝 *Description:* ${details.description}`);
            if (details.subscribers !== null) lines.push(`👥 *Subscribers:* ${details.subscribers}`);
            if (details.invite) {
                const invite = details.invite.startsWith('http')
                    ? details.invite
                    : `https://whatsapp.com/channel/${details.invite}`;
                lines.push(`🔗 *Invite:* ${invite}`);
            }

            await xcasper.sendMessage(chatId, { text: lines.join('\n') }, { quoted: msg });
        } catch (error) {
            await xcasper.sendMessage(chatId, {
                text: `❌ Failed to retrieve channel data: ${error.message}`
            }, { quoted: msg });
        }
    }
};
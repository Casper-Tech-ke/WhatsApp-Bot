import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

const EXPIRATIONS = {
    off: 0,
    '0': 0,
    '24h': 24 * 60 * 60,
    '1d': 24 * 60 * 60,
    '7d': 7 * 24 * 60 * 60,
    '90d': 90 * 24 * 60 * 60
};

const LABELS = {
    0: 'off',
    [24 * 60 * 60]: '24 hours',
    [7 * 24 * 60 * 60]: '7 days',
    [90 * 24 * 60 * 60]: '90 days'
};

export default {
    name: 'ephemeral',
    alias: ['disappearing', 'disappearingmessages', 'gcephemeral'],
    description: 'Set disappearing messages. Usage: .ephemeral off|24h|7d|90d',
    category: 'group',

    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups.');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group.');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be a group admin to change disappearing messages.');

        const option = q.toLowerCase();
        if (!(option in EXPIRATIONS)) {
            return reply(
                `⏱️ *Disappearing messages*\n\n` +
                `• \`${botPrefix}ephemeral off\`\n` +
                `• \`${botPrefix}ephemeral 24h\`\n` +
                `• \`${botPrefix}ephemeral 7d\`\n` +
                `• \`${botPrefix}ephemeral 90d\``
            );
        }

        try {
            const expiration = EXPIRATIONS[option];
            await xcasper.groupToggleEphemeral(from, expiration);
            await react('✅');
            return reply(`✅ Disappearing messages are now *${LABELS[expiration]}*.`);
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update disappearing messages: ${error.message}`);
        }
    }
};
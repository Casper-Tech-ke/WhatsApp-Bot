import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'accept',
    alias: ['approve'],
    description: 'Accept a pending join request. Usage: .accept 254712345678',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        if (!args[0]) return reply(`❌ Please provide a phone number.\n\n*Usage:* ${botPrefix}accept 254712345678`);

        try {
            const number = args[0].replace(/[^0-9]/g, '');
            const userJid = `${number}@s.whatsapp.net`;
            await xcasper.groupRequestParticipantsUpdate(from, [userJid], 'approve');
            await react('✅');
            return reply(`✅ Successfully approved @${number}'s join request!`, { mentions: [userJid] });
        } catch (error) {
            await react('❌');
            if (error.message?.includes('not-found') || error.message?.includes('item-not-found')) {
                return reply('❌ No pending join request found for this number.');
            }
            return reply(`❌ Failed to accept request: ${error.message}`);
        }
    }
};

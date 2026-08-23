import { buildGroupCtx, fetchGroupCtx, resolveTargetJid } from '../../lib/groupHelpers.js';

export default {
    name: 'accept',
    alias: ['approve'],
    description: 'Accept a pending join request. Usage: .accept 254712345678',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, botPrefix, q, mentionedJid, quotedUser } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, groupMetadata } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        const userJid = await resolveTargetJid(xcasper, { mentionedJid, quotedUser, q, groupMetadata });
        if (!userJid || userJid.endsWith('@lid')) {
            return reply(
                `❌ Please provide, mention, or reply to a pending member.\n\n` +
                `*Usage:* ${botPrefix}accept 254712345678\n` +
                `*Or:* ${botPrefix}accept @member`
            );
        }

        try {
            const number = userJid.split('@')[0].replace(/\D/g, '');
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

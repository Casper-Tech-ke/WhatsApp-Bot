import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'acceptall',
    alias: ['approveall'],
    description: 'Accept all pending join requests in the group',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        try {
            const pendingRequests = await xcasper.groupRequestParticipantsList(from);
            if (!pendingRequests || pendingRequests.length === 0) {
                return reply('📭 No pending join requests in this group.');
            }
            const jids = pendingRequests.map(r => r.jid);
            await xcasper.groupRequestParticipantsUpdate(from, jids, 'approve');
            await react('✅');
            return reply(`✅ Successfully approved *${jids.length}* pending join request(s)!`);
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to accept all requests: ${error.message}`);
        }
    }
};

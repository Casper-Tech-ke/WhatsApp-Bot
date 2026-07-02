import { buildGroupCtx, fetchGroupCtx, getLidMapping } from '../../lib/groupHelpers.js';

export default {
    name: 'listrequests',
    alias: ['joinrequests', 'listjoinrequests', 'pendingrequests'],
    description: 'List all pending join requests in the group',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, mek } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        try {
            const pendingRequests = await xcasper.groupRequestParticipantsList(from);
            if (!pendingRequests || pendingRequests.length === 0) {
                await react('📭');
                return reply('📭 No pending join requests in this group.');
            }

            const resolvedJids = await Promise.all(
                pendingRequests.map(async r => {
                    let jid = r.jid;
                    if (jid.endsWith('@lid')) {
                        const cached = getLidMapping(jid);
                        if (cached) return cached;
                        try {
                            const resolved = await xcasper.getJidFromLid(jid);
                            if (resolved) return resolved;
                        } catch {}
                    }
                    return jid;
                })
            );

            const requestList = resolvedJids.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`).join('\n');
            const message = `📋 *PENDING JOIN REQUESTS*\n\n📊 Total: *${pendingRequests.length}* request(s)\n\n${requestList}\n\n_Use .accept <number> or .acceptall to approve_\n_Use .reject <number> or .rejectall to decline_`;

            await react('✅');
            await xcasper.sendMessage(from, { text: message, mentions: resolvedJids }, { quoted: mek });
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to list requests: ${error.message}`);
        }
    }
};

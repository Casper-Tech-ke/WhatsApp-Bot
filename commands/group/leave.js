import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'left',
    alias: ['leave', 'exitgroup', 'exitgc', 'leavegroup'],
    description: 'Bot leaves the group. Owner only.',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, mek } = base;
        const { isGroup, isSuperUser, botName } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isSuperUser) return reply('❌ Owner Only Command!');

        try {
            await xcasper.sendMessage(from, {
                text: `👋 *Goodbye!*\n\n_${botName} is leaving this group..._`
            }, { quoted: mek });
            await new Promise(r => setTimeout(r, 1000));
            await xcasper.groupLeave(from);
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to leave group: ${error.message}`);
        }
    }
};

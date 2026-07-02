import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'groupname',
    alias: ['gcname', 'setgcname', 'setgroupname', 'gcsubject', 'setgcsubject'],
    description: 'Change group name/subject. Usage: .groupname New Name',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        if (!q) return reply(`❌ Please provide a new group name.\n\n*Usage:* ${botPrefix}groupname New Group Name`);

        try {
            await xcasper.groupUpdateSubject(from, q);
            await react('✅');
            return reply(`✅ Group name changed to: *${q}*`);
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to change group name: ${error.message}`);
        }
    }
};

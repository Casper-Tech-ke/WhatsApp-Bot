import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'addmode',
    alias: ['memberaddmode', 'groupaddmode'],
    description: 'Set who can add group members. Usage: .addmode admins|all',
    category: 'group',

    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups.');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group.');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be a group admin to change member-add mode.');

        const option = q.toLowerCase();
        const adminsOnly = ['admin', 'admins', 'admin_add'].includes(option);
        const allMembers = ['all', 'members', 'all_member_add'].includes(option);
        if (!adminsOnly && !allMembers) {
            return reply(
                `👥 *Member Add Mode*\n\n` +
                `• \`${botPrefix}addmode admins\` — only admins can add members\n` +
                `• \`${botPrefix}addmode all\` — all members can add members`
            );
        }

        try {
            await xcasper.groupMemberAddMode(from, adminsOnly ? 'admin_add' : 'all_member_add');
            await react('✅');
            return reply(adminsOnly
                ? '✅ Only *admins* can now add members.'
                : '✅ *All members* can now add members.');
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update member-add mode: ${error.message}`);
        }
    }
};
import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'joinapproval',
    alias: ['approvalmode', 'joinrequestmode', 'requestapproval'],
    description: 'Enable or disable approval for new join requests. Usage: .joinapproval on|off',
    category: 'group',

    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups.');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group.');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be a group admin to change join approval.');

        const option = q.toLowerCase();
        const enabled = ['on', 'enable', 'enabled'].includes(option);
        const disabled = ['off', 'disable', 'disabled'].includes(option);
        if (!enabled && !disabled) {
            return reply(
                `🛡️ *Join Request Approval*\n\n` +
                `• \`${botPrefix}joinapproval on\` — new members require approval\n` +
                `• \`${botPrefix}joinapproval off\` — disable join request approval`
            );
        }

        try {
            await xcasper.groupJoinApprovalMode(from, enabled ? 'on' : 'off');
            await react('✅');
            return reply(enabled
                ? '✅ New join requests now require *admin approval*.'
                : '✅ Join request approval is now *disabled*.');
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update join approval: ${error.message}`);
        }
    }
};
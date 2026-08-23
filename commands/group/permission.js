import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'permission',
    alias: ['grouppermission', 'gcpermission', 'editinfo', 'groupedit'],
    description: 'Set who can edit group information. Usage: .permission admins|all',
    category: 'group',

    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) {
            return reply('❌ You must be an admin to change group permissions!');
        }

        const setting = q.toLowerCase();
        if (!setting) {
            return reply(
                `🔐 *Group Information Permissions*\n\n` +
                `• \`${botPrefix}permission admins\` — only admins can edit group info\n` +
                `• \`${botPrefix}permission all\` — all members can edit group info`
            );
        }

        const adminsOnly = ['admin', 'admins', 'locked', 'lock'].includes(setting);
        const allMembers = ['all', 'members', 'unlocked', 'unlock'].includes(setting);
        if (!adminsOnly && !allMembers) {
            await react('❌');
            return reply(`❌ Choose \`${botPrefix}permission admins\` or \`${botPrefix}permission all\`.`);
        }

        try {
            await xcasper.groupSettingUpdate(from, adminsOnly ? 'locked' : 'unlocked');
            await react('✅');
            return reply(
                adminsOnly
                    ? '🔐 Group information can now be edited by *admins only*.'
                    : '🔓 Group information can now be edited by *all members*.'
            );
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update group permissions: ${error.message}`);
        }
    }
};
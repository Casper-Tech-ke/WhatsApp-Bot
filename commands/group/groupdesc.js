import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'gcdesc',
    alias: ['groupdesc', 'setgcdesc', 'setgroupdesc', 'description', 'setdescription'],
    description: 'Change group description. Usage: .gcdesc New description',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        if (!q) return reply(`❌ Please provide a new group description.\n\n*Usage:* ${botPrefix}gcdesc New description here`);

        try {
            await xcasper.groupUpdateDescription(from, q);
            await react('✅');
            return reply('✅ Group description updated successfully!');
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to change group description: ${error.message}`);
        }
    }
};

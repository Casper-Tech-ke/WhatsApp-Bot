import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';
import { getGroupSetting, setGroupSetting } from '../../lib/groupSettings.js';

export default {
    name: 'antipromote',
    alias: [],
    description: 'Toggle anti-promote protection. Demotes both promoter and promoted user.',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        const action = args[0]?.toLowerCase();
        const rawCurrent = getGroupSetting(from, 'ANTIPROMOTE');
        const current = rawCurrent === 'true' ? 'true' : 'false';

        if (!action || !['on', 'off'].includes(action)) {
            return reply(`🛡️ *Anti-Promote Protection*\n\nCurrent: ${current === 'true' ? 'ON ✅' : 'OFF ❌'}\n\n*Usage:*\n${botPrefix}antipromote on - Enable\n${botPrefix}antipromote off - Disable\n\n_When enabled, if someone promotes another user, both will be demoted._`);
        }

        const value = action === 'on' ? 'true' : 'false';
        if (current === value) {
            return reply(`⚠️ Anti-Promote is already ${action === 'on' ? 'ON' : 'OFF'}!`);
        }

        setGroupSetting(from, 'ANTIPROMOTE', value);
        await react('✅');
        return reply(`✅ Anti-Promote is now ${action === 'on' ? 'ON' : 'OFF'} for this group.`);
    }
};

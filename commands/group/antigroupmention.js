import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';
import { getGroupSetting, setGroupSetting } from '../../lib/groupSettings.js';

export default {
    name: 'antigroupmention',
    alias: ['antigcmention', 'antimentiongroup', 'antigcstatusmention', 'antistatusmention'],
    description: 'Toggle anti-group-mention protection. Modes: on/warn/delete/kick/off',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        try {
            const currentSetting = getGroupSetting(from, 'ANTIGROUPMENTION');
            const arg = q?.toLowerCase()?.trim();

            if (!arg) {
                const status = (currentSetting === 'false' || !currentSetting) ? 'OFF' : `ON (${currentSetting})`;
                return reply(`🛡️ *Anti-Group-Mention Status*\n\nCurrent: *${status}*\n\n*Usage:*\n• ${botPrefix}antigroupmention on - Enable with warnings\n• ${botPrefix}antigroupmention warn - Enable with warnings\n• ${botPrefix}antigroupmention delete - Delete message only\n• ${botPrefix}antigroupmention kick - Kick immediately\n• ${botPrefix}antigroupmention off - Disable`);
            }

            let newValue, message;
            if (arg === 'on' || arg === 'true' || arg === 'warn') {
                newValue = 'warn';
                message = '✅ Anti-Group-Mention *ENABLED* with warnings!\n\nUsers who mention this group in their status will be warned and kicked after reaching the warn limit.';
            } else if (arg === 'delete') {
                newValue = 'delete';
                message = '✅ Anti-Group-Mention *ENABLED* with delete!\n\nMessages mentioning this group in status will be deleted with a warning.';
            } else if (arg === 'kick') {
                newValue = 'kick';
                message = '✅ Anti-Group-Mention *ENABLED* with immediate kick!\n\nUsers who mention this group in their status will be kicked immediately.';
            } else if (arg === 'off' || arg === 'false') {
                newValue = 'false';
                message = '❌ Anti-Group-Mention *DISABLED*!';
            } else {
                return reply('❌ Invalid option. Use: on, warn, delete, kick, or off');
            }

            setGroupSetting(from, 'ANTIGROUPMENTION', newValue);
            await react('✅');
            return reply(message);
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update setting: ${error.message}`);
        }
    }
};

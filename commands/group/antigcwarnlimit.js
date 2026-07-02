import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';
import { getGroupSetting, setGroupSetting } from '../../lib/groupSettings.js';

export default {
    name: 'setantigcmentionwarnlimit',
    alias: ['antigcmentionwarnlimit', 'setantigroupmentionwarn', 'antigroupmentionwarnlimit', 'antigcwarnlimit2'],
    description: 'Set the warning limit for anti-group-mention before kicking',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        try {
            const currentLimit = getGroupSetting(from, 'ANTIGROUPMENTION_WARN_COUNT');

            if (!q || !q.trim()) {
                return reply(`⚙️ *Anti-Group-Mention Warn Limit*\n\nCurrent: *${currentLimit || 3}* warnings\n\n*Usage:* ${botPrefix}setantigcmentionwarnlimit <number>\n*Example:* ${botPrefix}setantigcmentionwarnlimit 5`);
            }

            const newLimit = parseInt(q.trim());
            if (isNaN(newLimit) || newLimit < 1 || newLimit > 50) {
                return reply('❌ Please provide a valid number between 1 and 50');
            }

            setGroupSetting(from, 'ANTIGROUPMENTION_WARN_COUNT', String(newLimit));
            await react('✅');
            return reply(`✅ Anti-Group-Mention warn limit set to *${newLimit}*!\n\nUsers will be kicked after ${newLimit} warnings.`);
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update warn limit: ${error.message}`);
        }
    }
};

import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';
import { getGroupSetting, setGroupSetting } from '../../lib/groupSettings.js';

export default {
    name: 'goodbye',
    alias: ['setgoodbye', 'goodbyemsg', 'gcbye', 'byemsg'],
    description: 'Set goodbye message for members who leave. Use {user} for number, {group} for name.',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        const sub = args[0]?.toLowerCase();

        if (!sub) {
            const enabled = getGroupSetting(from, 'GOODBYE_ENABLED');
            const msg_ = getGroupSetting(from, 'GOODBYE_MESSAGE');
            return reply(
                `👋 *Goodbye Message Settings*\n\n` +
                `Status: ${enabled === 'true' ? '✅ ON' : '❌ OFF'}\n` +
                `Message: ${msg_ || '_(default)_'}\n\n` +
                `*Usage:*\n` +
                `• ${botPrefix}goodbye on — Enable\n` +
                `• ${botPrefix}goodbye off — Disable\n` +
                `• ${botPrefix}goodbye set Your goodbye message here\n\n` +
                `*Placeholders:*\n` +
                `• {user} → member's number\n` +
                `• {group} → group name\n` +
                `• {count} → remaining member count`
            );
        }

        if (sub === 'on') {
            setGroupSetting(from, 'GOODBYE_ENABLED', 'true');
            await react('✅');
            return reply('✅ Goodbye message *ENABLED* for this group!');
        }

        if (sub === 'off') {
            setGroupSetting(from, 'GOODBYE_ENABLED', 'false');
            await react('✅');
            return reply('❌ Goodbye message *DISABLED* for this group.');
        }

        if (sub === 'set' || sub === 'msg') {
            const newMsg = args.slice(1).join(' ').trim();
            if (!newMsg) return reply(`❌ Please provide a message.\n\n*Example:* ${botPrefix}goodbye set Goodbye {user}! We'll miss you in {group} 👋`);
            setGroupSetting(from, 'GOODBYE_MESSAGE', newMsg);
            await react('✅');
            return reply(`✅ Goodbye message set to:\n\n_${newMsg}_`);
        }

        if (sub === 'reset') {
            setGroupSetting(from, 'GOODBYE_MESSAGE', null);
            await react('✅');
            return reply('✅ Goodbye message reset to default.');
        }

        return reply(`❌ Unknown subcommand. Use: on, off, set, reset`);
    }
};

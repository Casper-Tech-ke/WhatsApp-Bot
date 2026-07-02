import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';
import { getGroupSetting, setGroupSetting } from '../../lib/groupSettings.js';

export default {
    name: 'welcome',
    alias: ['setwelcome', 'welcomemsg', 'welcomeset'],
    description: 'Set welcome message for new group members. Use {user} for mention, {group} for name, {count} for member count.',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        const sub = args[0]?.toLowerCase();

        if (!sub) {
            const enabled = getGroupSetting(from, 'WELCOME_ENABLED');
            const msg_ = getGroupSetting(from, 'WELCOME_MESSAGE');
            return reply(
                `👋 *Welcome Message Settings*\n\n` +
                `Status: ${enabled === 'true' ? '✅ ON' : '❌ OFF'}\n` +
                `Message: ${msg_ || '_(default)_'}\n\n` +
                `*Usage:*\n` +
                `• ${botPrefix}welcome on — Enable\n` +
                `• ${botPrefix}welcome off — Disable\n` +
                `• ${botPrefix}welcome set Your welcome message here\n\n` +
                `*Placeholders:*\n` +
                `• {user} → tags the new member\n` +
                `• {group} → group name\n` +
                `• {count} → member count`
            );
        }

        if (sub === 'on') {
            setGroupSetting(from, 'WELCOME_ENABLED', 'true');
            await react('✅');
            return reply('✅ Welcome message *ENABLED* for this group!');
        }

        if (sub === 'off') {
            setGroupSetting(from, 'WELCOME_ENABLED', 'false');
            await react('✅');
            return reply('❌ Welcome message *DISABLED* for this group.');
        }

        if (sub === 'set' || sub === 'msg') {
            const newMsg = args.slice(1).join(' ').trim();
            if (!newMsg) return reply(`❌ Please provide a message.\n\n*Example:* ${botPrefix}welcome set Welcome {user} to {group}! We now have {count} members 🎉`);
            setGroupSetting(from, 'WELCOME_MESSAGE', newMsg);
            await react('✅');
            return reply(`✅ Welcome message set to:\n\n_${newMsg}_`);
        }

        if (sub === 'reset') {
            setGroupSetting(from, 'WELCOME_MESSAGE', null);
            await react('✅');
            return reply('✅ Welcome message reset to default.');
        }

        return reply(`❌ Unknown subcommand. Use: on, off, set, reset`);
    }
};

import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'mute',
    alias: ['close', 'groupmute', 'gcmute', 'gcclose'],
    description: 'Close group chat (only admins can send messages)',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, sender } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) {
            const num = sender.split('@')[0];
            return reply(`@${num} This bot is not an admin`, { mentions: [`${num}@s.whatsapp.net`] });
        }
        if (!isAdmin && !isSuperAdmin && !isSuperUser) {
            const num = sender.split('@')[0];
            return reply(`@${num} you are not an admin`, { mentions: [`${num}@s.whatsapp.net`] });
        }

        try {
            await xcasper.groupSettingUpdate(from, 'announcement');
            const num = sender.split('@')[0];
            return reply(`@${num} Group successfully muted as you wished!`, { mentions: [`${num}@s.whatsapp.net`] });
        } catch (error) {
            return reply(`❌ Failed to mute group: ${error.message}`);
        }
    }
};

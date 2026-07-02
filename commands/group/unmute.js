import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'unmute',
    alias: ['open', 'groupopen', 'gcopen', 'adminonly', 'adminsonly'],
    description: 'Open group chat (allow all members to send messages)',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, sender } = base;
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
            await xcasper.groupSettingUpdate(from, 'not_announcement');
            const num = sender.split('@')[0];
            return reply(`@${num} Group successfully unmuted as you wished!`, { mentions: [`${num}@s.whatsapp.net`] });
        } catch (error) {
            return reply(`❌ Failed to unmute group: ${error.message}`);
        }
    }
};

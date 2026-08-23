import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'mute',
    alias: ['close', 'groupmute', 'gcmute', 'gcclose'],
    description: 'Close group chat (only admins can send messages)',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, senderJid } = await fetchGroupCtx(xcasper, msg, ctx);
        const mentionJid = senderJid?.endsWith('@s.whatsapp.net') ? senderJid : null;
        const mentionOptions = mentionJid ? { mentions: [mentionJid] } : {};
        const senderNumber = mentionJid?.split('@')[0];

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) {
            return senderNumber
                ? reply(`@${senderNumber} This bot is not an admin`, mentionOptions)
                : reply('❌ This bot is not an admin in this group.');
        }
        if (!isAdmin && !isSuperAdmin && !isSuperUser) {
            return senderNumber
                ? reply(`@${senderNumber} you are not an admin`, mentionOptions)
                : reply('❌ You are not an admin.');
        }

        try {
            await xcasper.groupSettingUpdate(from, 'announcement');
            return senderNumber
                ? reply(`@${senderNumber} Group successfully muted as you wished!`, mentionOptions)
                : reply('✅ Group successfully muted.');
        } catch (error) {
            return reply(`❌ Failed to mute group: ${error.message}`);
        }
    }
};

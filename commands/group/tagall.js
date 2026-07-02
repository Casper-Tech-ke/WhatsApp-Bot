import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'tagall',
    alias: ['mentionall'],
    description: 'Tag all group members with optional message',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, isGroup, reply, react, mek, q, sender } = base;
        const { isAdmin, isSuperAdmin, isSuperUser, botName } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ Admin/Owner Only Command!');

        try {
            const meta = await xcasper.groupMetadata(from);
            const participants = meta.participants;

            const superAdmins = [], admins = [], members = [];
            for (const p of participants) {
                if (p.admin === 'superadmin') superAdmins.push(p.id);
                else if (p.admin === 'admin') admins.push(p.id);
                else members.push(p.id);
            }

            const sorted = [...superAdmins, ...admins, ...members];
            let text = `*${botName} TAGALL*\n\n`;
            if (q?.trim()) text += `*Message:* ${q.trim()}\n\n`;
            text += `*Tagged By:* @${sender.split('@')[0]}\n\n*Tagged Members:*\n`;
            for (const id of superAdmins) text += `👑 @${id.split('@')[0]}\n`;
            for (const id of admins) text += `👮 @${id.split('@')[0]}\n`;
            for (const id of members) text += `👤 @${id.split('@')[0]}\n`;

            const mentions = [...sorted, sender];

            await xcasper.sendMessage(from, { text: text.trim(), mentions }, { quoted: mek });
            await react('✅');
        } catch (error) {
            return reply(`❌ Failed to tag all: ${error.message}`);
        }
    }
};

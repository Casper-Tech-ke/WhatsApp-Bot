import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'everyone',
    alias: ['tag', 'all', 'mention'],
    description: 'Tag everyone in the group with a group mention',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, isGroup, reply, mek, q, sender } = base;
        const { isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command can only be used in groups!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) {
            const num = sender.split('@')[0];
            return reply(`@${num} Only group admins can use this command!`, { mentions: [`${num}@s.whatsapp.net`] });
        }

        const subject = q || 'everyone';
        let participants = [];
        try {
            const meta = await xcasper.groupMetadata(from);
            participants = meta.participants;
        } catch {}

        const mentionedJids = participants.map(p => {
            const jid = typeof p === 'string' ? p : (p.id || p.jid || p.pn || '');
            if (!jid) return null;
            return jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
        }).filter(Boolean);

        try {
            await xcasper.sendMessage(from, {
                text: `@${from}`,
                contextInfo: {
                    mentionedJid: mentionedJids,
                    groupMentions: [{ groupJid: from, groupSubject: subject }]
                }
            }, { quoted: mek });
        } catch (error) {
            return reply(`❌ Failed to tag all: ${error.message}`);
        }
    }
};

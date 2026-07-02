import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'hidetag',
    alias: ['htag', 'hidden', 'hidtag'],
    description: 'Send a message that secretly tags everyone in the group',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, isGroup, reply, mek, q, sender, quotedMsg, botPrefix } = base;
        const { isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command can only be used in groups!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) {
            const num = sender.split('@')[0];
            return reply(`@${num} Only group admins can use this command!`, { mentions: [`${num}@s.whatsapp.net`] });
        }

        let text = q;
        if (!text && quotedMsg) {
            text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || '';
        }

        if (!text) return reply(`❌ Please provide a message or reply to one.\n\n*Usage:* ${botPrefix}hidetag Your message here`);

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
                text,
                contextInfo: { mentionedJid: mentionedJids }
            }, { quoted: mek });
        } catch (error) {
            return reply(`❌ Failed to send hidden tag: ${error.message}`);
        }
    }
};

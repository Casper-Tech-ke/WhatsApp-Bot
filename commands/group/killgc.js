import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'killgc',
    alias: ['terminategc', 'destroygc', 'nukegc'],
    description: 'Terminate group — removes all members and bot leaves. Owner only.',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, mek, sender } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, botName } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isSuperUser) return reply('❌ Owner Only Command!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin) return reply('❌ You must be an admin to use this command!');

        try {
            await xcasper.sendMessage(from, {
                text: `⚠️ *WARNING* ⚠️\n\n💀 *Group will be terminated now...*\n\n_All members will be removed._\n\n⚠️ _Using this command frequently might lead to WhatsApp bans._`
            }, { quoted: mek });

            await new Promise(r => setTimeout(r, 1000));

            const meta = await xcasper.groupMetadata(from);
            const botJid = (xcasper.user?.id?.split(':')[0] || '') + '@s.whatsapp.net';
            const membersToRemove = meta.participants
                .filter(p => p.id !== botJid && p.id !== sender)
                .map(p => p.id);

            if (membersToRemove.length > 0) {
                await xcasper.groupParticipantsUpdate(from, membersToRemove, 'remove');
            }

            await xcasper.groupLeave(from);
        } catch (error) {
            await react('❌');
            await reply(`❌ Failed to terminate group: ${error.message}`);
        }
    }
};

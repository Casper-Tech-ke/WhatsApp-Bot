import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'link',
    alias: ['gclink', 'grouplink', 'invitelink', 'groupinvite'],
    description: 'Get the group invite link',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, mek } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        try {
            const meta = await xcasper.groupMetadata(from);
            const groupName = meta.subject;
            const participantCount = meta.participants.length;
            const adminCount = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
            const inviteCode = await xcasper.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

            const linkText = `*🔗 Group Invite Link*\n\n*Group:* ${groupName}\n*Participants:* ${participantCount}\n*Admins:* ${adminCount}\n\n*Link:* ${inviteLink}`;

            await xcasper.sendMessage(from, { text: linkText }, { quoted: mek });
            await react('✅');
        } catch (error) {
            await react('❌');
            await reply(`❌ Failed to get invite link: ${error.message}`);
        }
    }
};

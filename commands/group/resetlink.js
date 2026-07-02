import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'resetlink',
    alias: ['resetgclink', 'revoke', 'resetgrouplink', 'revokelink', 'newlink'],
    description: 'Reset the group invite link',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, mek } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        try {
            await xcasper.groupRevokeInvite(from);
            const newInviteCode = await xcasper.groupInviteCode(from);
            const newLink = `https://chat.whatsapp.com/${newInviteCode}`;
            const groupMeta = await xcasper.groupMetadata(from);
            const groupName = groupMeta.subject;
            const totalMembers = groupMeta.participants.length;
            const totalAdmins = groupMeta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;

            const message = `🔄 *GROUP LINK RESET*\n\n📛 *Group:* ${groupName}\n👥 *Total Members:* ${totalMembers}\n👑 *Total Admins:* ${totalAdmins}\n\n🔗 *New Link:*\n${newLink}\n\n_The old invite link has been revoked._`;

            await react('✅');
            await xcasper.sendMessage(from, { text: message }, { quoted: mek });
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to reset group link: ${error.message}`);
        }
    }
};

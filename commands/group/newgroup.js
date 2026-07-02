import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'newgroup',
    alias: ['newgc', 'creategroup', 'creategc'],
    description: 'Create a new group with the bot. Owner only.',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, mek, sender } = base;
        const { isSuperUser, botName } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isSuperUser) return reply('❌ Owner Only Command!');

        if (!q || !q.trim()) {
            await react('❌');
            return reply(`❌ Please provide a group name.\nExample: ${prefix}newgroup My Group Name`);
        }

        const groupName = q.trim();

        try {
            const group = await xcasper.groupCreate(groupName, [sender]);
            const inviteCode = await xcasper.groupInviteCode(group.id);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

            const successText = `*🆕 Group Created Successfully!*\n\n*Group Name:* ${groupName}\n*Group ID:* ${group.id}\n\n*Invite Link:* ${inviteLink}`;
            await xcasper.sendMessage(from, { text: successText }, { quoted: mek });
            await react('✅');
        } catch (error) {
            await react('❌');
            await reply(`❌ Failed to create group: ${error.message}`);
        }
    }
};

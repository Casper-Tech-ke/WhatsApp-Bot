import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'add',
    alias: ['addmember'],
    description: 'Add a user to the group. Usage: .add 254712345678',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, groupMetadata } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        if (!q) {
            await react('❌');
            return reply(`❌ Please provide the number to add.\nExample: ${botPrefix}add 254712345678`);
        }

        const num = q.replace(/[^0-9]/g, '');
        if (num.length < 10) {
            await react('❌');
            return reply('❌ Invalid number format. Please provide a valid phone number.');
        }

        const targetJid = num + '@s.whatsapp.net';

        try {
            const [result] = await xcasper.onWhatsApp(num);
            if (!result || !result.exists) {
                await react('❌');
                return reply(`❌ The number ${num} is not registered on WhatsApp.`);
            }
        } catch {
            await react('⚠️');
            return reply(`⚠️ Could not verify if ${num} is on WhatsApp. Please try again.`);
        }

        if (groupMetadata?.participants) {
            const alreadyIn = groupMetadata.participants.find(p => (p.id || p.pn || '').split('@')[0] === num);
            if (alreadyIn) {
                await react('❌');
                return reply(`❌ @${num} is already in this group.`, { mentions: [targetJid] });
            }
        }

        try {
            const result = await xcasper.groupParticipantsUpdate(from, [targetJid], 'add');
            const status = result[0]?.status;

            if (status === '403') {
                const meta = await xcasper.groupMetadata(from);
                const groupName = meta.subject;
                const inviteCode = await xcasper.groupInviteCode(from);
                const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
                await xcasper.sendMessage(targetJid, {
                    text: `👋 Hello! You've been invited to join *${groupName}*\n\n🔗 *Invite Link:* ${inviteLink}\n\n_Click the link above to join the group._`
                });
                await react('⚠️');
                await reply(`⚠️ @${num} has privacy settings that prevent adding directly. An invite link has been sent to their DM.`, { mentions: [targetJid] });
            } else if (status === '408') {
                await react('❌');
                await reply(`❌ @${num} has left this group recently and cannot be added yet.`, { mentions: [targetJid] });
            } else if (status === '409') {
                await react('❌');
                await reply(`❌ @${num} is already in this group.`, { mentions: [targetJid] });
            } else {
                await react('✅');
                await reply(`✅ @${num} has been added to the group.`, { mentions: [targetJid] });
            }
        } catch (error) {
            await react('❌');
            await reply(`❌ Failed to add user: ${error.message}`);
        }
    }
};

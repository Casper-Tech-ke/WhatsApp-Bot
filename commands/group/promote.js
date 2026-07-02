import { buildGroupCtx, fetchGroupCtx, resolveTargetJid } from '../../lib/groupHelpers.js';

export default {
    name: 'promote',
    alias: ['toadmin', 'makeadmin'],
    description: 'Promote a user to admin',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, mentionedJid, quotedUser } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, groupMetadata, groupAdmins, groupSuperAdmins } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        let targetJid = await resolveTargetJid(xcasper, { mentionedJid, quotedUser, q, groupMetadata });

        if (!targetJid || targetJid.includes('@lid')) {
            await react('❌');
            return reply('❌ Could not identify user. Please provide their number directly.\nExample: .promote 254712345678');
        }

        const targetNum = targetJid.split('@')[0];
        const adminNums = groupAdmins.map(a => a.split('@')[0]);
        const superAdminNums = groupSuperAdmins.map(a => a.split('@')[0]);

        let isAlreadyAdmin = adminNums.includes(targetNum);
        let isSuperAdminTarget = superAdminNums.includes(targetNum);

        if (groupMetadata?.participants) {
            const participant = groupMetadata.participants.find(p => (p.id || p.pn || '').split('@')[0] === targetNum);
            if (participant?.admin) {
                isAlreadyAdmin = true;
                if (participant.admin === 'superadmin') isSuperAdminTarget = true;
            }
        }

        if (isSuperAdminTarget) {
            return reply(`❌ @${targetNum} is the group owner and is already an admin.`, { mentions: [targetJid] });
        }
        if (isAlreadyAdmin) {
            return reply(`❌ @${targetNum} is already an admin.`, { mentions: [targetJid] });
        }

        try {
            await xcasper.groupParticipantsUpdate(from, [targetJid], 'promote');
            await react('✅');
            await reply(`👑 @${targetNum} is now an admin.`, { mentions: [targetJid] });
        } catch (error) {
            await react('❌');
            if (error.message?.includes('403') || error.message?.toLowerCase().includes('forbidden')) {
                await reply(`❌ Cannot promote @${targetNum}. They may not be a group member.`, { mentions: [targetJid] });
            } else {
                await reply(`❌ Failed to promote: ${error.message}`);
            }
        }
    }
};

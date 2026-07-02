import { buildGroupCtx, fetchGroupCtx, resolveTargetJid } from '../../lib/groupHelpers.js';

export default {
    name: 'demote',
    alias: ['unadmin', 'removeadmin'],
    description: 'Demote a user from being an admin',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, mentionedJid, quotedUser } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, superUser, groupMetadata, groupAdmins, groupSuperAdmins } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        let targetJid = await resolveTargetJid(xcasper, { mentionedJid, quotedUser, q, groupMetadata });

        if (!targetJid || targetJid.includes('@lid')) {
            await react('❌');
            return reply('❌ Could not identify user. Please provide their number directly.\nExample: .demote 254712345678');
        }

        const targetNum = targetJid.split('@')[0];
        const standardizedSuperUsers = superUser.map(u => u.split('@')[0]);
        if (standardizedSuperUsers.includes(targetNum)) {
            await react('❌');
            return reply('❌ I cannot demote a superuser!');
        }

        const adminNums = groupAdmins.map(a => a.split('@')[0]);
        const superAdminNums = groupSuperAdmins.map(a => a.split('@')[0]);

        let isTargetAdmin = adminNums.includes(targetNum);
        let isSuperAdminTarget = superAdminNums.includes(targetNum);

        if (groupMetadata?.participants) {
            const participant = groupMetadata.participants.find(p => {
                const pNum = (p.id || p.pn || '').split('@')[0];
                return pNum === targetNum;
            });
            if (participant?.admin) {
                isTargetAdmin = true;
                if (participant.admin === 'superadmin') isSuperAdminTarget = true;
            }
        }

        if (!isTargetAdmin) {
            return reply(`❌ @${targetNum} is not an admin.`, { mentions: [targetJid] });
        }
        if (isSuperAdminTarget) {
            return reply(`❌ @${targetNum} is the group owner and cannot be demoted.`, { mentions: [targetJid] });
        }

        try {
            await xcasper.groupParticipantsUpdate(from, [targetJid], 'demote');
            await react('✅');
            await reply(`👑 @${targetNum} is no longer an admin.`, { mentions: [targetJid] });
        } catch (error) {
            await react('❌');
            if (error.message?.includes('403') || error.message?.toLowerCase().includes('forbidden')) {
                await reply(`❌ Cannot demote @${targetNum}. They may be a group owner or have higher privileges.`, { mentions: [targetJid] });
            } else {
                await reply(`❌ Failed to demote: ${error.message}`);
            }
        }
    }
};

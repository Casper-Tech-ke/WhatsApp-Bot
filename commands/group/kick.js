import { buildGroupCtx, fetchGroupCtx, resolveTargetJid } from '../../lib/groupHelpers.js';

export default {
    name: 'kick',
    alias: ['remove'],
    description: 'Remove a user from the group',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, mentionedJid, quotedUser, sender } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, superUser, groupMetadata, groupSuperAdmins } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups!');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group!');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be an admin to use this command!');

        let targetJid = await resolveTargetJid(xcasper, { mentionedJid, quotedUser, q, groupMetadata });

        if (!targetJid || targetJid.includes('@lid')) {
            await react('❌');
            return reply('❌ Could not identify user. Please provide their number directly.\nExample: .kick 254712345678');
        }

        const targetNum = targetJid.split('@')[0];
        const standardizedSuperUsers = superUser.map(u => u.split('@')[0]);
        if (standardizedSuperUsers.includes(targetNum)) {
            await react('❌');
            return reply('❌ I cannot kick my creator!');
        }

        const botJid = (xcasper.user?.id?.split(':')[0] || '') + '@s.whatsapp.net';
        if (targetJid.toLowerCase() === botJid.toLowerCase()) {
            await react('❌');
            return reply('❌ I cannot kick myself!');
        }

        const superAdminNums = groupSuperAdmins.map(a => a.split('@')[0]);
        let isSuperAdminTarget = superAdminNums.includes(targetNum);

        if (groupMetadata?.participants) {
            const participant = groupMetadata.participants.find(p => (p.id || p.pn || '').split('@')[0] === targetNum);
            if (participant?.admin === 'superadmin') isSuperAdminTarget = true;
        }

        if (isSuperAdminTarget) {
            await react('❌');
            return reply(`❌ @${targetNum} is the group owner and cannot be kicked.`, { mentions: [targetJid] });
        }

        try {
            await xcasper.groupParticipantsUpdate(from, [targetJid], 'remove');
            await react('✅');
            await reply(`🚫 @${targetNum} has been removed from the group.`, { mentions: [targetJid] });
        } catch (error) {
            await react('❌');
            if (error.message?.includes('403') || error.message?.toLowerCase().includes('forbidden')) {
                await reply(`❌ Cannot kick @${targetNum}. They may be an admin or not in the group.`, { mentions: [targetJid] });
            } else {
                await reply(`❌ Failed to remove user: ${error.message}`);
            }
        }
    }
};

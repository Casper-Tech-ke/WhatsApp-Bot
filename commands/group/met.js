import { buildGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'met',
    alias: ['groupinfo', 'gcinfo', 'metadata'],
    description: 'Display group metadata and participant list',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const { from, isGroup, reply, react, mek } = buildGroupCtx(xcasper, msg, args, prefix);

        if (!isGroup) return reply('❌ This command only works in groups!');

        try {
            const gInfo = await xcasper.groupMetadata(from);

            const formatJid = (jid) => {
                if (!jid) return 'N/A';
                return `@${jid.split('@')[0]}`;
            };

            const superAdmins = [];
            const admins = [];
            const members = [];

            gInfo.participants.forEach(p => {
                const formattedJid = formatJid(p.phoneNumber || p.pn || p.id);
                if (p.admin === 'superadmin') superAdmins.push(`• ${formattedJid} - 👑 Super Admin`);
                else if (p.admin === 'admin') admins.push(`• ${formattedJid} - 👮 Admin`);
                else members.push(`• ${formattedJid} - 👤 Member`);
            });

            const allParticipants = [...superAdmins, ...admins, ...members].join('\n');
            const allAdmins = [
                ...superAdmins.map(s => s.replace(' - 👑 Super Admin', '')),
                ...admins.map(a => a.replace(' - 👮 Admin', ''))
            ];

            const metadataText = `📌 *GROUP METADATA* 📌

🔹 *ID:* ${gInfo.id}
🔹 *Subject:* ${gInfo.subject || 'None'}
🔹 *Subject Owner:* ${formatJid(gInfo.subjectOwnerJid)}
🔹 *Subject Changed:* ${gInfo.subjectTime ? new Date(gInfo.subjectTime * 1000).toLocaleString() : 'N/A'}
🔹 *Owner:* ${formatJid(gInfo.owner)}
🔹 *Creation Date:* ${gInfo.creation ? new Date(gInfo.creation * 1000).toLocaleString() : 'N/A'}
🔹 *Size:* ${gInfo.size || gInfo.participants.length} participants
🔹 *Description:* ${gInfo.desc || 'None'}

👑 *ADMINS (${superAdmins.length + admins.length})*
${allAdmins.join('\n') || 'No admins'}

👥 *PARTICIPANTS (${gInfo.participants.length})*
${allParticipants}

ℹ️ *GROUP SETTINGS*
• Restrict: ${gInfo.restrict ? '✅' : '❌'}
• Announce: ${gInfo.announce ? '✅' : '❌'}
• Join Approval: ${gInfo.joinApprovalMode ? '✅' : '❌'}
• Member Add: ${gInfo.memberAddMode ? '✅' : '❌'}
• Community: ${gInfo.isCommunity ? '✅' : '❌'}`.trim();

            await xcasper.sendMessage(from, { text: metadataText }, { quoted: mek });
            await react('✅');
        } catch (error) {
            await react('❌');
            await reply('Failed to fetch group metadata.');
        }
    }
};

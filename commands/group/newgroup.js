import { buildGroupCtx } from '../../lib/groupHelpers.js';

export default {
    name: 'newgroup',
    alias: ['newgc', 'creategroup', 'creategc'],
    description: 'Create a group. Usage: .creategroup Group Name | 254700000000,254711111111',
    category: 'group',
    ownerOnly: true,
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, q, mek } = base;

        if (!q || !q.trim()) {
            await react('❌');
            return reply(
                `❌ *Usage:* \`${prefix}creategroup Group Name | 254700000000,254711111111\`\n\n` +
                `_At least one member number is required._`
            );
        }

        const [rawName, ...rawNumbers] = q.split('|');
        const groupName = rawName.trim();
        const memberInputs = rawNumbers.join('|')
            .split(',')
            .map((number) => number.replace(/\D/g, ''))
            .filter(Boolean);

        if (!groupName || memberInputs.length === 0) {
            await react('❌');
            return reply(
                `❌ *Usage:* \`${prefix}creategroup Group Name | 254700000000,254711111111\`\n\n` +
                `_Provide a group name and at least one member number._`
            );
        }

        const invalidNumbers = memberInputs.filter((number) => number.length < 7 || number.length > 15);
        if (invalidNumbers.length) {
            await react('❌');
            return reply(`❌ Invalid phone number${invalidNumbers.length > 1 ? 's' : ''}: ${invalidNumbers.map((number) => `+${number}`).join(', ')}`);
        }

        const memberNumbers = [...new Set(memberInputs)];
        const members = [];
        const unavailable = [];

        for (const number of memberNumbers) {
            try {
                const [result] = await xcasper.onWhatsApp(number);
                if (result?.exists) {
                    members.push(result.jid || `${number}@s.whatsapp.net`);
                } else {
                    unavailable.push(number);
                }
            } catch {
                unavailable.push(number);
            }
        }

        if (members.length === 0) {
            await react('❌');
            return reply(`❌ None of the supplied numbers could be verified on WhatsApp: ${memberNumbers.map((number) => `+${number}`).join(', ')}`);
        }

        try {
            const group = await xcasper.groupCreate(groupName, members);
            const inviteCode = await xcasper.groupInviteCode(group.id);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            const addedNumbers = members.map((jid) => `+${jid.split('@')[0]}`);

            const successText = [
                `*🆕 Group Created Successfully!*`,
                ``,
                `*Group Name:* ${groupName}`,
                `*Group ID:* ${group.id}`,
                `*Members Added:* ${addedNumbers.join(', ')}`,
                `*Invite Link:* ${inviteLink}`,
                unavailable.length
                    ? `\n⚠️ Could not add unverified number${unavailable.length > 1 ? 's' : ''}: ${unavailable.map((number) => `+${number}`).join(', ')}`
                    : ''
            ].filter(Boolean).join('\n');
            await xcasper.sendMessage(from, { text: successText }, { quoted: mek });
            await react('✅');
        } catch (error) {
            await react('❌');
            await reply(`❌ Failed to create group: ${error.message}`);
        }
    }
};

import { buildGroupCtx } from '../../lib/groupHelpers.js';

function parseInviteCode(input = '') {
    const value = input.trim();
    const link = value.match(/^(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)\/?$/i);
    if (link) return link[1];
    return /^[A-Za-z0-9_-]{10,64}$/.test(value) ? value : null;
}

export default {
    name: 'joingroup',
    alias: ['joinlink', 'joininvite', 'acceptlink'],
    description: 'Join a group from an invite link or code.',
    category: 'group',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const { from, reply, react, q, botPrefix } = buildGroupCtx(xcasper, msg, args, prefix);
        const inviteCode = parseInviteCode(q);

        if (!inviteCode) {
            return reply(
                `❌ Provide a valid WhatsApp group invite link or code.\n\n` +
                `*Usage:* \`${botPrefix}joingroup https://chat.whatsapp.com/XXXX\``
            );
        }

        try {
            await react('⏳');
            const groupJid = await xcasper.groupAcceptInvite(inviteCode);
            let groupName = '';
            try {
                const metadata = groupJid ? await xcasper.groupMetadata(groupJid) : null;
                groupName = metadata?.subject || '';
            } catch {}

            await react('✅');
            return reply(
                `✅ Joined the group successfully.${groupName ? `\n\n📛 *Group:* ${groupName}` : ''}` +
                `${groupJid ? `\n🆔 *Group JID:* \`${groupJid}\`` : ''}`
            );
        } catch (error) {
            await react('❌');
            return reply(`❌ Could not join this group. The invite may be expired, revoked, or unavailable.\n\n${error.message}`);
        }
    }
};
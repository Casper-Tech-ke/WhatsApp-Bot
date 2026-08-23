import { buildGroupCtx } from '../../lib/groupHelpers.js';
import { getQuotedContextInfo } from '../../lib/mediaHelpers.js';

export default {
    name: 'acceptinvite',
    alias: ['acceptgroupinvite', 'joinfrominvite', 'acceptinvitev4'],
    description: 'Reply to a WhatsApp group invite message to join the invited group.',
    category: 'group',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const { from, reply, react, botPrefix } = buildGroupCtx(xcasper, msg, args, prefix);
        const contextInfo = getQuotedContextInfo(msg);
        const inviteMessage = contextInfo?.quotedMessage?.groupInviteMessage;
        const stanzaId = contextInfo?.stanzaId;
        const quotedSender = contextInfo?.participant
            || (from.endsWith('@s.whatsapp.net') || from.endsWith('@lid') ? from : null);

        if (!inviteMessage || !stanzaId || !quotedSender) {
            return reply(
                `❌ Reply to a WhatsApp group invite message.\n\n` +
                `*Usage:* Reply to the invite with \`${botPrefix}acceptinvite\`.`
            );
        }

        const key = {
            remoteJid: quotedSender,
            fromMe: false,
            id: stanzaId
        };
        if (contextInfo.participant) key.participant = contextInfo.participant;

        try {
            await react('⏳');
            await xcasper.groupAcceptInviteV4(key, inviteMessage);
            await react('✅');
            return reply(`✅ Joined *${inviteMessage.groupName || 'the invited group'}* successfully.`);
        } catch (error) {
            await react('❌');
            return reply(`❌ Could not accept this group invite. It may be expired, revoked, or unavailable.\n\n${error.message}`);
        }
    }
};
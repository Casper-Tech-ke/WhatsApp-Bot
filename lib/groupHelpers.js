export function getLidMapping(lid) {
    if (!lid || !lid.includes('@lid')) return null;
    const lidNum = lid.split('@')[0];
    const phone = globalThis.lidPhoneCache?.get(lidNum);
    return phone ? `${phone}@s.whatsapp.net` : null;
}

function normalizeParticipantJid(jid = '') {
    if (!jid) return '';
    const bareJid = jid.split('@')[0].split(':')[0];
    return jid.endsWith('@lid')
        ? `${bareJid}@lid`
        : `${bareJid}@s.whatsapp.net`;
}

export function participantMatchesJid(participant, targetJid = '') {
    if (!participant || !targetJid) return false;

    const target = String(targetJid);
    const targetNumber = target.split('@')[0].split(':')[0].replace(/\D/g, '');
    const identifiers = [
        participant.id,
        participant.pn,
        participant.phoneNumber,
        participant.lid,
        participant.lidJid
    ].filter(Boolean).map(String);

    return identifiers.some((identifier) => {
        if (identifier === target) return true;
        if (identifier.endsWith('@lid') || target.endsWith('@lid')) return false;

        const identifierNumber = identifier.split('@')[0].split(':')[0].replace(/\D/g, '');
        return Boolean(targetNumber) && identifierNumber === targetNumber;
    });
}

function toPhoneJid(value) {
    if (!value || String(value).endsWith('@lid')) return null;
    const number = String(value).split('@')[0].split(':')[0].replace(/\D/g, '');
    return number.length >= 7 && number.length <= 15
        ? `${number}@s.whatsapp.net`
        : null;
}

export async function convertLidToJid(xcasper, lid) {
    if (!lid || !lid.includes('@lid')) return lid;
    const cached = getLidMapping(lid);
    if (cached) return cached;
    try {
        const result = await xcasper.getJidFromLid(lid);
        if (result) return result;
    } catch {}
    return lid;
}

export async function resolveTargetJid(xcasper, { mentionedJid, quotedUser, q, groupMetadata }) {
    let targetJid = null;

    if (mentionedJid && mentionedJid.length > 0) {
        targetJid = await convertLidToJid(xcasper, mentionedJid[0]);
    } else if (quotedUser) {
        targetJid = await convertLidToJid(xcasper, quotedUser);
    } else if (q) {
        const num = q.replace(/[^0-9]/g, '');
        if (num.length >= 10) targetJid = num + '@s.whatsapp.net';
    }

    if (targetJid && targetJid.includes('@lid') && groupMetadata?.participants) {
        const lidNum = targetJid.split('@')[0];
        const found = groupMetadata.participants.find(
            p => p.lid?.split('@')[0] === lidNum
                || p.lidJid?.split('@')[0] === lidNum
                || p.id?.split('@')[0] === lidNum
        );
        const resolvedPhoneJid = found && [
            found.phoneNumber,
            found.pn,
            found.id
        ].map(toPhoneJid).find(Boolean);
        if (resolvedPhoneJid) targetJid = resolvedPhoneJid;
    }

    if (targetJid && !targetJid.includes('@')) targetJid += '@s.whatsapp.net';
    return targetJid;
}

export function buildGroupCtx(xcasper, msg, args, prefix) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const rawParticipant = msg.key?.participant || '';
    const rawSender = isGroup ? rawParticipant : from;
    const sender = normalizeParticipantJid(rawSender);

    const q = args.join(' ').trim();
    const mek = msg;
    const botPrefix = prefix;

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant || null;
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;

    const reply = (text, opts = {}) => xcasper.sendMessage(from, { text: String(text), ...opts }, { quoted: msg });
    const react = (emoji) => xcasper.sendMessage(from, { react: { text: emoji, key: msg.key } });
    const send = (content) => xcasper.sendMessage(from, content, { quoted: msg });

    return { from, isGroup, sender, q, mek, botPrefix, mentionedJid, quotedUser, quotedMsg, quoted: quotedMsg, reply, react, send, args };
}

export async function fetchGroupCtx(xcasper, msg, ctx) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const rawParticipant = msg.key?.participant || '';
    const rawSender = isGroup ? rawParticipant : from;
    let senderJid = normalizeParticipantJid(rawSender);

    let groupMetadata = null;
    let groupAdmins = [];
    let groupSuperAdmins = [];
    let participants = [];
    let isBotAdmin = false;
    let isAdmin = false;
    let isSuperAdmin = false;

    if (isGroup) {
        try { groupMetadata = await xcasper.groupMetadata(from); } catch {}
        participants = groupMetadata?.participants || [];
        const adminParticipants = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const superAdminParticipants = participants.filter(p => p.admin === 'superadmin');
        groupAdmins = adminParticipants.map(p => p.id);
        groupSuperAdmins = superAdminParticipants.map(p => p.id);

        const senderParticipant = participants.find((p) => participantMatchesJid(p, senderJid));
        const senderPhoneJid = senderParticipant && [
            senderParticipant.phoneNumber,
            senderParticipant.pn,
            senderParticipant.id
        ].map(toPhoneJid).find(Boolean);
        if (senderPhoneJid) senderJid = senderPhoneJid;

        const botJid = normalizeParticipantJid(xcasper.user?.id || '');
        isBotAdmin = adminParticipants.some(p => participantMatchesJid(p, botJid));
        isAdmin = adminParticipants.some(p => participantMatchesJid(p, senderJid));
        isSuperAdmin = superAdminParticipants.some(p => participantMatchesJid(p, senderJid));
    }

    const isSuperUser = ctx.isOwner();
    const superUser = [ctx.OWNER_JID, ctx.OWNER_NUMBER ? ctx.OWNER_NUMBER + '@s.whatsapp.net' : null].filter(Boolean);
    const botName = ctx.BOT_NAME;

    return { isGroup, groupMetadata, groupAdmins, groupSuperAdmins, participants, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser, superUser, botName, senderJid };
}

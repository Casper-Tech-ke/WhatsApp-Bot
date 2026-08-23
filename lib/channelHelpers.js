import { convertLidToJid } from './groupHelpers.js';
import { getQuotedContextInfo } from './mediaHelpers.js';

const CHANNEL_LINK = /(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i;
const GROUP_LINK = /(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i;

export function isChannelJid(jid = '') {
    return String(jid).endsWith('@newsletter');
}

export function asChannelJid(value = '') {
    const raw = String(value).trim();
    if (!raw) return null;
    if (isChannelJid(raw)) return raw;
    return /^\d{10,30}$/.test(raw) ? `${raw}@newsletter` : null;
}

export function readMetadataText(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        return value.text || Object.values(value).find((item) => typeof item === 'string') || '';
    }
    return String(value);
}

export function channelDetails(metadata = {}, fallbackJid = '') {
    const thread = metadata.thread_metadata || {};
    const rawJid = metadata.id || metadata.jid || fallbackJid;
    const jid = asChannelJid(rawJid) || fallbackJid;
    const subscribers = Number(metadata.subscribers ?? thread.subscribers_count);

    return {
        jid,
        name: readMetadataText(metadata.name) || readMetadataText(thread.name) || 'Unknown',
        description: readMetadataText(metadata.description) || readMetadataText(thread.description),
        subscribers: Number.isFinite(subscribers) ? subscribers : null,
        invite: metadata.invite || readMetadataText(thread.invite)
    };
}

export async function resolveChannelTarget(xcasper, chatId, input = '') {
    const raw = String(input).trim();
    if (!raw && isChannelJid(chatId)) return { jid: chatId };

    const directJid = asChannelJid(raw);
    if (directJid) return { jid: directJid };

    const linkMatch = raw.match(CHANNEL_LINK);
    if (!linkMatch) {
        return { error: 'Use this command in a channel, provide a channel JID, or provide a WhatsApp channel link.' };
    }

    try {
        const metadata = await xcasper.newsletterMetadata('invite', linkMatch[1]);
        const jid = asChannelJid(metadata?.id || metadata?.jid || '');
        return jid
            ? { jid, metadata }
            : { error: 'WhatsApp did not return a channel identity for that link.' };
    } catch {
        return { error: 'Could not resolve that channel link. It may be private or unavailable.' };
    }
}

export async function resolveProfileTarget(xcasper, msg, args = []) {
    const chatId = msg.key.remoteJid;
    const input = args.join(' ').trim();
    const contextInfo = getQuotedContextInfo(msg);

    if (!input && contextInfo?.participant) {
        const target = await convertLidToJid(xcasper, contextInfo.participant);
        return { jid: target, type: target?.endsWith('@lid') ? 'linked device' : 'account' };
    }

    if (!input) {
        const target = msg.key.remoteJidAlt || chatId;
        if (isChannelJid(target)) return { jid: target, type: 'channel' };
        if (target.endsWith('@g.us')) return { jid: target, type: 'group/community' };
        return { jid: await convertLidToJid(xcasper, target), type: 'account' };
    }

    const channelLink = input.match(CHANNEL_LINK);
    if (channelLink) {
        const channel = await resolveChannelTarget(xcasper, chatId, input);
        return channel.jid
            ? { jid: channel.jid, type: 'channel' }
            : { error: channel.error };
    }

    const groupMatch = input.match(GROUP_LINK);
    if (groupMatch) {
        try {
            const group = await xcasper.groupGetInviteInfo(groupMatch[1]);
            if (group?.id) return { jid: group.id, type: 'group/community' };
        } catch {}
        return { error: 'Could not resolve that group or community link.' };
    }

    if (input.endsWith('@g.us')) return { jid: input, type: 'group/community' };
    if (input.endsWith('@lid')) return { jid: await convertLidToJid(xcasper, input), type: 'linked device' };
    if (input.endsWith('@s.whatsapp.net')) return { jid: input, type: 'account' };

    const isPhoneInput = /^\+?[\d\s()-]+$/.test(input);
    const number = input.replace(/\D/g, '');
    if (isPhoneInput && number.length >= 7 && number.length <= 15) {
        return { jid: `${number}@s.whatsapp.net`, type: 'account' };
    }

    const channel = await resolveChannelTarget(xcasper, chatId, input);
    if (channel.jid) return { jid: channel.jid, type: 'channel' };

    return { error: 'Provide a phone number, group/community link, channel link, JID, or reply to a message.' };
}
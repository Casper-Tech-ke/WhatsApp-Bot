// commands/bot/deletedmsgs.js
// ALICIAH AI - Browse Deleted Messages DB
// Powered by CASPER TECH KE

import fs from 'fs';

const ANTIDELETE_DB_FILE = './data/antidelete_db.json';
const ANTIDELETE_MAX_AGE = 3 * 60 * 60 * 1000;

function loadDb() {
    try {
        if (fs.existsSync(ANTIDELETE_DB_FILE))
            return JSON.parse(fs.readFileSync(ANTIDELETE_DB_FILE, 'utf8'));
    } catch {}
    return {};
}

function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

function getContentPreview(message) {
    const skip = new Set(['messageContextInfo', 'senderKeyDistributionMessage', 'protocolMessage', 'deviceSentMessage']);
    const type = Object.keys(message || {}).find(k => !skip.has(k));
    if (!type) return '❓ Unknown';
    const m = message[type];
    switch (type) {
        case 'conversation':          return `💬 ${m?.substring(0, 60) || '(text)'}`;
        case 'extendedTextMessage':   return `💬 ${m?.text?.substring(0, 60) || '(text)'}`;
        case 'imageMessage':          return `🖼️ Image${m?.caption ? ` — ${m.caption.substring(0, 40)}` : ''}`;
        case 'videoMessage':          return `🎥 Video${m?.caption ? ` — ${m.caption.substring(0, 40)}` : ''}`;
        case 'audioMessage':          return m?.ptt ? '🎤 Voice note' : '🎵 Audio';
        case 'stickerMessage':        return '🪄 Sticker';
        case 'documentMessage':       return `📄 ${m?.fileName || 'Document'}`;
        case 'contactMessage':        return `👤 Contact: ${m?.displayName || ''}`;
        case 'locationMessage':       return '📍 Location';
        default:                      return `📦 ${type.replace('Message', '')}`;
    }
}

export default {
    name: 'deletedmsgs',
    alias: ['dmsgs', 'deleted', 'antidb'],
    description: 'Browse the anti-delete message database',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        const sub    = args[0]?.toLowerCase();
        const limit  = parseInt(args[1]) || 10;

        const db      = loadDb();
        const now     = Date.now();
        const entries = Object.values(db)
            .filter(e => now - (e.timestamp || 0) <= ANTIDELETE_MAX_AGE)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (entries.length === 0) {
            return xcasper.sendMessage(chatId, {
                text: `📭 *Deleted Messages DB*\n\nNo messages cached yet.\nEnable anti-delete with \`${prefix}antidelete on\` to start capturing.`
            }, { quoted: msg });
        }

        // .deletedmsgs list [n] — show last N deleted entries overall
        if (!sub || sub === 'list' || sub === 'all') {
            const shown = entries.slice(0, Math.min(limit, 20));
            const lines = shown.map((e, i) => {
                const num    = (e.sender || '').split(':')[0].split('@')[0];
                const name   = e.pushName ? `${e.pushName} (+${num})` : `+${num}`;
                const chat   = e.chatId?.endsWith('@g.us') ? '👥' : '👤';
                const preview = getContentPreview(e.message);
                return `${i + 1}. ${chat} *${name}*\n   ${preview}\n   🕒 ${timeAgo(e.timestamp)}`;
            }).join('\n\n');

            return xcasper.sendMessage(chatId, {
                text: `🗑️ *Last ${shown.length} Deleted Messages*\n_(${entries.length} total cached, <3h old)_\n\n${lines}\n\n_Use \`${prefix}deletedmsgs chat\` to filter by this chat._`
            }, { quoted: msg });
        }

        // .deletedmsgs chat [n] — show deleted msgs from current chat only
        if (sub === 'chat' || sub === 'here') {
            const filtered = entries.filter(e => e.chatId === chatId).slice(0, Math.min(limit, 20));
            if (filtered.length === 0) {
                return xcasper.sendMessage(chatId, {
                    text: `📭 No deleted messages cached for this chat yet.`
                }, { quoted: msg });
            }
            const lines = filtered.map((e, i) => {
                const num     = (e.sender || '').split(':')[0].split('@')[0];
                const name    = e.pushName ? `${e.pushName} (+${num})` : `+${num}`;
                const preview = getContentPreview(e.message);
                return `${i + 1}. 👤 *${name}*\n   ${preview}\n   🕒 ${timeAgo(e.timestamp)}`;
            }).join('\n\n');

            return xcasper.sendMessage(chatId, {
                text: `🗑️ *Deleted Messages — This Chat*\n_(${filtered.length} found)_\n\n${lines}`
            }, { quoted: msg });
        }

        // .deletedmsgs stats — summary breakdown
        if (sub === 'stats') {
            const chatMap = {};
            for (const e of entries) {
                chatMap[e.chatId] = (chatMap[e.chatId] || 0) + 1;
            }
            const topChats = Object.entries(chatMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([jid, count]) => {
                    const label = jid.endsWith('@g.us') ? `👥 Group (${jid.split('@')[0]})` : `👤 +${jid.split('@')[0]}`;
                    return `• ${label}: ${count} msg(s)`;
                }).join('\n');

            return xcasper.sendMessage(chatId, {
                text: `📊 *Anti-Delete DB Stats*\n\n` +
                      `💾 Cached (last 3h): ${entries.length}\n` +
                      `💬 Active chats: ${Object.keys(chatMap).length}\n\n` +
                      `*Top chats:*\n${topChats}\n\n` +
                      `_Use \`${prefix}antidelete clear\` to wipe the DB._`
            }, { quoted: msg });
        }

        // fallback — show help
        return xcasper.sendMessage(chatId, {
            text: `🗑️ *Deleted Messages Browser*\n\n` +
                  `• \`${prefix}deletedmsgs\` — last 10 deleted msgs\n` +
                  `• \`${prefix}deletedmsgs list 20\` — last 20\n` +
                  `• \`${prefix}deletedmsgs chat\` — this chat only\n` +
                  `• \`${prefix}deletedmsgs chat 5\` — last 5 from this chat\n` +
                  `• \`${prefix}deletedmsgs stats\` — breakdown by chat`
        }, { quoted: msg });
    }
};

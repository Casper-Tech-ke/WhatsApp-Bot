// commands/bot/antidelete.js
// ALICIAH AI - Anti-Delete Command
// JSON DB backed, auto-clears messages older than 3h
// Powered by CASPER TECH KE

import fs from 'fs';

const ANTI_SETTINGS_FILE  = './data/anti_settings.json';
const ANTIDELETE_DB_FILE  = './data/antidelete_db.json';

function loadAntiSettings() {
    try { if (fs.existsSync(ANTI_SETTINGS_FILE)) return JSON.parse(fs.readFileSync(ANTI_SETTINGS_FILE, 'utf8')); } catch {}
    return { antisticker: {}, antiall: {}, antidelete: { enabled: false, mode: 'samechat' } };
}
function saveAntiSettings(data) {
    try { if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true }); fs.writeFileSync(ANTI_SETTINGS_FILE, JSON.stringify(data, null, 2)); return true; } catch { return false; }
}
function getDbStats() {
    try {
        if (!fs.existsSync(ANTIDELETE_DB_FILE)) return { total: 0, chats: 0 };
        const db = JSON.parse(fs.readFileSync(ANTIDELETE_DB_FILE, 'utf8'));
        const entries = Object.values(db);
        const chats = new Set(entries.map(e => e.chatId)).size;
        return { total: entries.length, chats };
    } catch { return { total: 0, chats: 0 }; }
}
function clearDb() {
    try {
        fs.writeFileSync(ANTIDELETE_DB_FILE, JSON.stringify({}, null, 2));
        return true;
    } catch { return false; }
}

export default {
    name: 'antidelete',
    alias: ['antidel', 'antirevoke'],
    description: 'Catch deleted messages and resend them (same chat or owner DM)',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sub = args[0]?.toLowerCase();
        const settings = loadAntiSettings();

        if (!settings.antidelete) settings.antidelete = { enabled: false, mode: 'samechat' };

        if (sub === 'on') {
            const mode = args[1]?.toLowerCase() === 'dm' ? 'dm' : 'samechat';
            settings.antidelete = { enabled: true, mode };
            saveAntiSettings(settings);
            const modeLabel = mode === 'dm' ? '📩 Deleted messages → your DM' : '💬 Deleted messages → same chat';
            return xcasper.sendMessage(chatId, {
                text: `✅ *Anti-Delete ENABLED*\n\n🗑️ Deleted messages will be recovered.\n${modeLabel}\n\n💾 Messages are stored in JSON DB and auto-cleared after *3 hours*.\n\n_Use \`${prefix}antidelete on dm\` for DM mode._\n_Use \`${prefix}antidelete off\` to disable._`
            }, { quoted: msg });
        }

        if (sub === 'off') {
            settings.antidelete = { enabled: false, mode: settings.antidelete.mode || 'samechat' };
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `❎ *Anti-Delete DISABLED*\n\nDeleted messages will no longer be recovered.\n\n💾 The message DB is preserved. Use \`${prefix}antidelete clear\` to wipe it.`
            }, { quoted: msg });
        }

        if (sub === 'dm') {
            settings.antidelete.mode = 'dm';
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Anti-Delete mode → 📩 DM*\nDeleted messages will be sent to your private chat with the bot.`
            }, { quoted: msg });
        }

        if (sub === 'samechat' || sub === 'sc') {
            settings.antidelete.mode = 'samechat';
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Anti-Delete mode → 💬 Same Chat*\nDeleted messages will be resent in the original chat.`
            }, { quoted: msg });
        }

        if (sub === 'clear' || sub === 'reset') {
            clearDb();
            return xcasper.sendMessage(chatId, {
                text: `🗑️ *Anti-Delete DB cleared!*\nAll cached messages have been wiped.`
            }, { quoted: msg });
        }

        if (sub === 'stats' || sub === 'db') {
            const stats = getDbStats();
            return xcasper.sendMessage(chatId, {
                text: `📊 *Anti-Delete DB Stats*\n\n💾 Cached messages: ${stats.total}\n💬 Active chats: ${stats.chats}\n⏱️ Auto-clear: every 3 hours`
            }, { quoted: msg });
        }

        const enabled = settings.antidelete.enabled;
        const mode    = settings.antidelete.mode || 'samechat';
        const stats   = getDbStats();
        return xcasper.sendMessage(chatId, {
            text: `🗑️ *Anti-Delete*\n\n` +
                  `Status : ${enabled ? '🟢 ON' : '🔴 OFF'}\n` +
                  `Mode   : ${mode === 'dm' ? '📩 DM' : '💬 Same Chat'}\n` +
                  `DB     : ${stats.total} msgs cached across ${stats.chats} chat(s)\n` +
                  `Expiry : auto-clear after 3 hours\n\n` +
                  `*Usage:*\n` +
                  `• \`${prefix}antidelete on\` — enable (same chat)\n` +
                  `• \`${prefix}antidelete on dm\` — enable (send to your DM)\n` +
                  `• \`${prefix}antidelete dm\` — switch to DM mode\n` +
                  `• \`${prefix}antidelete samechat\` — switch to same chat mode\n` +
                  `• \`${prefix}antidelete stats\` — show DB stats\n` +
                  `• \`${prefix}antidelete clear\` — wipe cached messages\n` +
                  `• \`${prefix}antidelete off\` — disable`
        }, { quoted: msg });
    }
};

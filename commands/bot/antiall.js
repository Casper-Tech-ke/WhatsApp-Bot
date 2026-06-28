// commands/bot/antiall.js
// ALICIAH AI - Anti-All Command
// Block all messages in a chat — warns 5x then blocks sender
// Powered by CASPER TECH KE

import fs from 'fs';
const ANTI_SETTINGS_FILE = './data/anti_settings.json';

function loadAntiSettings() {
    try { if (fs.existsSync(ANTI_SETTINGS_FILE)) return JSON.parse(fs.readFileSync(ANTI_SETTINGS_FILE, 'utf8')); } catch {}
    return { antisticker: {}, antiall: {}, antidelete: { enabled: false, mode: 'samechat' } };
}
function saveAntiSettings(data) {
    try { if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true }); fs.writeFileSync(ANTI_SETTINGS_FILE, JSON.stringify(data, null, 2)); return true; } catch { return false; }
}

export default {
    name: 'antiall',
    alias: ['lockdown', 'noall'],
    description: 'Block all messages in this chat — warns 5x then blocks the sender',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sub = args[0]?.toLowerCase();
        const settings = loadAntiSettings();

        if (!settings.antiall) settings.antiall = {};

        if (sub === 'on') {
            settings.antiall[chatId] = true;
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Anti-All ENABLED*\n\n🔒 This chat is now locked.\n⚠️ Anyone who sends a message (except the owner) will be warned up to 5 times, then blocked.\n\n_Use \`${prefix}antiall off\` to unlock._`
            }, { quoted: msg });
        }

        if (sub === 'off') {
            delete settings.antiall[chatId];
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `❎ *Anti-All DISABLED*\n\nThis chat is now unlocked. Messages are allowed again.`
            }, { quoted: msg });
        }

        const status = settings.antiall[chatId] ? '🟢 ON' : '🔴 OFF';
        return xcasper.sendMessage(chatId, {
            text: `🔒 *Anti-All*\nStatus: ${status}\n\n*Usage:*\n• \`${prefix}antiall on\` — lock chat\n• \`${prefix}antiall off\` — unlock chat`
        }, { quoted: msg });
    }
};

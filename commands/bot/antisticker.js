// commands/bot/antisticker.js
// ALICIAH AI - Anti-Sticker Command
// Warn 5x then delete + block. Works in DM or group.
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
    name: 'antisticker',
    alias: ['antisvg', 'nosticker'],
    description: 'Block stickers in this chat — warns 5x then blocks the sender',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sub = args[0]?.toLowerCase();
        const settings = loadAntiSettings();

        if (!settings.antisticker) settings.antisticker = {};

        if (sub === 'on') {
            settings.antisticker[chatId] = true;
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Anti-Sticker ENABLED*\n\n🚫 Stickers are now blocked in this chat.\n⚠️ Senders will be warned up to 5 times, then blocked.\n\n_Use \`${prefix}antisticker off\` to disable._`
            }, { quoted: msg });
        }

        if (sub === 'off') {
            delete settings.antisticker[chatId];
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `❎ *Anti-Sticker DISABLED*\n\nStickers are now allowed in this chat.`
            }, { quoted: msg });
        }

        const status = settings.antisticker[chatId] ? '🟢 ON' : '🔴 OFF';
        return xcasper.sendMessage(chatId, {
            text: `🛡️ *Anti-Sticker*\nStatus: ${status}\n\n*Usage:*\n• \`${prefix}antisticker on\` — enable\n• \`${prefix}antisticker off\` — disable`
        }, { quoted: msg });
    }
};

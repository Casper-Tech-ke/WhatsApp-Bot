// commands/bot/antidelete.js
// ALICIAH AI - Anti-Delete Command
// Catches deleted messages and resends them in same chat or to owner DM
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
                text: `✅ *Anti-Delete ENABLED*\n\n🗑️ Deleted messages will be recovered.\n${modeLabel}\n\n_Use \`${prefix}antidelete on dm\` for DM mode._\n_Use \`${prefix}antidelete off\` to disable._`
            }, { quoted: msg });
        }

        if (sub === 'off') {
            settings.antidelete = { enabled: false, mode: 'samechat' };
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `❎ *Anti-Delete DISABLED*\n\nDeleted messages will no longer be recovered.`
            }, { quoted: msg });
        }

        if (sub === 'dm' || sub === 'samechat' || sub === 'mode') {
            const mode = args[1]?.toLowerCase() === 'dm' ? 'dm' : 'samechat';
            settings.antidelete.mode = mode;
            saveAntiSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Anti-Delete mode changed:* ${mode === 'dm' ? '📩 DM' : '💬 Same Chat'}`
            }, { quoted: msg });
        }

        const enabled = settings.antidelete.enabled;
        const mode = settings.antidelete.mode || 'samechat';
        return xcasper.sendMessage(chatId, {
            text: `🗑️ *Anti-Delete*\nStatus: ${enabled ? '🟢 ON' : '🔴 OFF'}\nMode: ${mode === 'dm' ? '📩 DM' : '💬 Same Chat'}\n\n*Usage:*\n• \`${prefix}antidelete on\` — enable (same chat)\n• \`${prefix}antidelete on dm\` — enable (send to your DM)\n• \`${prefix}antidelete off\` — disable`
        }, { quoted: msg });
    }
};

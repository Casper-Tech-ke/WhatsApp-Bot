import fs from 'fs';

const SETTINGS_FILE = './data/auto_status_settings.json';

function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
    } catch {}
    return {};
}

function saveSettings(settings) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch {}
}

export default {
    name: 'autoview',
    alias: ['autoviewstatus', 'autosee', 'viewstatus'],
    description: 'Toggle auto-viewing of WhatsApp statuses',
    category: 'automation',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, { BOT_NAME }) {
        const chatId = msg.key.remoteJid;
        const settings = loadSettings();
        const current = settings.autoviewStatus === 'true';

        if (args[0] === 'on') {
            settings.autoviewStatus = 'true';
            saveSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Auto-View Status: ON*\n\n👁️ ${BOT_NAME} will now automatically view all statuses.\n\n_People will see that the bot viewed their status (based on your read receipts setting)._`
            }, { quoted: msg });
        }

        if (args[0] === 'off') {
            settings.autoviewStatus = 'false';
            saveSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `❌ *Auto-View Status: OFF*\n\n👁️ ${BOT_NAME} will no longer auto-view statuses.`
            }, { quoted: msg });
        }

        const toggled = !current;
        settings.autoviewStatus = toggled ? 'true' : 'false';
        saveSettings(settings);

        return xcasper.sendMessage(chatId, {
            text: `${toggled ? '✅' : '❌'} *Auto-View Status: ${toggled ? 'ON' : 'OFF'}*\n\n👁️ ${BOT_NAME} will ${toggled ? 'now' : 'no longer'} automatically view statuses.\n\n_Use \`${prefix}autoview on\` or \`${prefix}autoview off\` to set explicitly._`
        }, { quoted: msg });
    }
};

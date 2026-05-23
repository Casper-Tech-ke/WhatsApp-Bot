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
    name: 'autoreact',
    alias: ['autoreactstatus', 'autolike', 'likestatuses'],
    description: 'Toggle auto-reacting to WhatsApp statuses with emoji',
    category: 'automation',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, { BOT_NAME }) {
        const chatId = msg.key.remoteJid;
        const settings = loadSettings();

        if (args[0] === 'on') {
            settings.autoLikeStatus = 'true';
            saveSettings(settings);
            const emojis = settings.statusLikeEmojis || '❤️';
            return xcasper.sendMessage(chatId, {
                text: `✅ *Auto-React Status: ON*\n\n💬 ${BOT_NAME} will now auto-react to statuses.\n🎭 *Emojis:* ${emojis}\n\n_Use \`${prefix}autoreact emoji ❤️,🔥,😍\` to change emojis._`
            }, { quoted: msg });
        }

        if (args[0] === 'off') {
            settings.autoLikeStatus = 'false';
            saveSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `❌ *Auto-React Status: OFF*\n\n${BOT_NAME} will no longer auto-react to statuses.`
            }, { quoted: msg });
        }

        if (args[0] === 'emoji' || args[0] === 'emojis') {
            const emojiInput = args.slice(1).join(' ').trim();
            if (!emojiInput) {
                const current = settings.statusLikeEmojis || '❤️';
                return xcasper.sendMessage(chatId, {
                    text: `🎭 *Current Reaction Emojis:* ${current}\n\n_Usage: \`${prefix}autoreact emoji ❤️,🔥,😍\`\nSeparate multiple emojis with commas._`
                }, { quoted: msg });
            }
            settings.statusLikeEmojis = emojiInput;
            saveSettings(settings);
            return xcasper.sendMessage(chatId, {
                text: `✅ *Reaction Emojis Updated!*\n\n🎭 New emojis: ${emojiInput}\n\n_One will be picked at random for each status._`
            }, { quoted: msg });
        }

        if (args[0] === 'reply') {
            const subCmd = args[1];
            if (subCmd === 'on') {
                settings.autoReplyStatus = 'true';
                saveSettings(settings);
                const text = settings.statusReplyText || '🔥 Nice status!';
                return xcasper.sendMessage(chatId, {
                    text: `✅ *Auto-Reply Status: ON*\n\n💬 Reply text: "${text}"\n\n_Use \`${prefix}autoreact reply text Your message here\` to change the text._`
                }, { quoted: msg });
            }
            if (subCmd === 'off') {
                settings.autoReplyStatus = 'false';
                saveSettings(settings);
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Auto-Reply Status: OFF*`
                }, { quoted: msg });
            }
            if (subCmd === 'text') {
                const replyText = args.slice(2).join(' ').trim();
                if (!replyText) {
                    return xcasper.sendMessage(chatId, {
                        text: `_Usage: \`${prefix}autoreact reply text Your message here\`_`
                    }, { quoted: msg });
                }
                settings.statusReplyText = replyText;
                saveSettings(settings);
                return xcasper.sendMessage(chatId, {
                    text: `✅ *Auto-Reply Text Updated!*\n\n💬 "${replyText}"`
                }, { quoted: msg });
            }
        }

        if (args[0] === 'status' || args[0] === 'settings') {
            const s = loadSettings();
            return xcasper.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🎭 *STATUS AUTOMATION*\n┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n┃  👁️ Auto-View: ${s.autoviewStatus === 'true' ? '✅ ON' : '❌ OFF'}\n┃  ❤️ Auto-React: ${s.autoLikeStatus === 'true' ? '✅ ON' : '❌ OFF'}\n┃  💬 Auto-Reply: ${s.autoReplyStatus === 'true' ? '✅ ON' : '❌ OFF'}\n┃  🎭 Emojis: ${s.statusLikeEmojis || '❤️'}\n┃  📝 Reply: ${s.statusReplyText || '🔥 Nice status!'}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
        }

        const current = settings.autoLikeStatus === 'true';
        const toggled = !current;
        settings.autoLikeStatus = toggled ? 'true' : 'false';
        saveSettings(settings);

        return xcasper.sendMessage(chatId, {
            text: `${toggled ? '✅' : '❌'} *Auto-React Status: ${toggled ? 'ON' : 'OFF'}*\n\n╭─────────────────────\n│ ${prefix}autoreact on/off — toggle react\n│ ${prefix}autoreact emoji ❤️,🔥 — set emojis\n│ ${prefix}autoreact reply on/off — toggle reply\n│ ${prefix}autoreact reply text <msg> — set reply text\n│ ${prefix}autoreact settings — view all settings\n│ ${prefix}autoview on/off — toggle auto-view\n╰─────────────────────`
        }, { quoted: msg });
    }
};

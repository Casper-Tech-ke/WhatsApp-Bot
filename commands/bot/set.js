export default {
    name: 'set',
    alias: ['config', 'botset', 'settings'],
    description: 'View and update bot configuration (mode, prefix, name, status)',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, {
        BOT_NAME,
        VERSION,
        saveBotMode,
        saveBotName,
        getBotMode,
        updatePrefix,
        getCurrentPrefix,
        isPrefixless,
        getAutoStatusSettings,
        saveAutoStatusSettings
    }) {
        const chatId = msg.key.remoteJid;
        const sub = args[0]?.toLowerCase();

        const currentMode = getBotMode();
        const currentPrefix = getCurrentPrefix();
        const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;

        const VALID_MODES = ['public', 'private', 'group-only', 'maintenance', 'silent'];

        const MODE_DESC = {
            public:      '🟢 Everyone can use commands',
            private:     '🔴 Only the owner can use commands',
            'group-only':'👥 Only works inside groups',
            maintenance: '🔧 Only ping/help/status work',
            silent:      '🔇 No responses at all (stealth)'
        };

        // ── SHOW ALL SETTINGS ─────────────────────────────────────────────
        if (!sub || sub === 'show' || sub === 'status') {
            const st = getAutoStatusSettings();
            const viewIcon  = st.autoviewStatus === 'true' ? '✅' : '❌';
            const likeIcon  = st.autoLikeStatus === 'true' ? '✅' : '❌';
            const replyIcon = st.autoReplyStatus === 'true' ? '✅' : '❌';
            return xcasper.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚙️ *BOT CONFIGURATION*
┃  🤖 ${BOT_NAME} v${VERSION}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🌐 *Mode:*    ${currentMode}
┃  💬 *Prefix:*  ${prefixDisplay}
┃  📛 *Name:*    ${BOT_NAME}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👁️ *Auto View Status:*  ${viewIcon}
┃  🩵 *Auto Like Status:*  ${likeIcon}
┃  💬 *Auto Reply Status:* ${replyIcon}
┃  😊 *Like Emoji:*  ${st.statusLikeEmojis}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📋 *Available Commands:*
┃  ├ ${prefix}set public / private / group
┃  ├ ${prefix}set maintenance / silent
┃  ├ ${prefix}set prefix <symbol>
┃  ├ ${prefix}set name <new name>
┃  ├ ${prefix}set autoview on/off
┃  ├ ${prefix}set autolike on/off
┃  └ ${prefix}set likeemoji <emoji>
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
        }

        // ── SET BOT MODE ──────────────────────────────────────────────────
        if (sub === 'public' || sub === 'private' || sub === 'group' ||
            sub === 'group-only' || sub === 'maintenance' || sub === 'silent') {

            const mode = sub === 'group' ? 'group-only' : sub;
            const result = saveBotMode(mode);

            if (!result.success) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Failed to set mode:* ${result.error}`
                }, { quoted: msg });
            }

            return xcasper.sendMessage(chatId, {
                text: `✅ *Bot Mode Updated!*\n\n🌐 Mode: *${mode}*\n📝 ${MODE_DESC[mode]}\n\n_Use \`${prefix}set\` to view all settings._`
            }, { quoted: msg });
        }

        // ── SET PREFIX ────────────────────────────────────────────────────
        if (sub === 'prefix') {
            const newPrefix = args[1];
            if (!newPrefix) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}set prefix <symbol>\`\n\n_Examples:_\n• \`${prefix}set prefix !\`\n• \`${prefix}set prefix /\`\n• \`${prefix}set prefix none\` _(prefixless mode)_`
                }, { quoted: msg });
            }

            const result = updatePrefix(newPrefix);

            if (!result.success) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Failed to update prefix:* ${result.error}`
                }, { quoted: msg });
            }

            const isNow = result.isPrefixless;
            return xcasper.sendMessage(chatId, {
                text: `✅ *Prefix Updated!*\n\n${isNow ? '💬 Mode: *Prefixless* (no prefix needed)\n_Users type commands directly without a symbol._' : `💬 New Prefix: *"${result.newPrefix}"*\n_Users now type commands like: \`${result.newPrefix}ping\`_`}\n\n_Previous prefix: ${result.oldPrefix || 'none'}_`
            }, { quoted: msg });
        }

        // ── SET BOT NAME ──────────────────────────────────────────────────
        if (sub === 'name') {
            const newName = args.slice(1).join(' ').trim();
            if (!newName) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}set name <new name>\`\n\n_Example: \`${prefix}set name ALICIAH AI\`_`
                }, { quoted: msg });
            }
            if (newName.length > 32) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Name too long.* Maximum 32 characters.\n_Provided: ${newName.length} characters._`
                }, { quoted: msg });
            }

            const saved = saveBotName(newName);
            if (!saved) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Failed to save bot name.*`
                }, { quoted: msg });
            }

            return xcasper.sendMessage(chatId, {
                text: `✅ *Bot Name Updated!*\n\n📛 New name: *${newName}*\n\n_The name change takes effect immediately for all new messages._`
            }, { quoted: msg });
        }

        // ── AUTO VIEW STATUS ──────────────────────────────────────────────
        if (sub === 'autoview') {
            const val = args[1]?.toLowerCase();
            if (val !== 'on' && val !== 'off') {
                const current = getAutoStatusSettings().autoviewStatus === 'true';
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}set autoview on/off\`\n\n_Currently: ${current ? '✅ ON' : '❌ OFF'}_`
                }, { quoted: msg });
            }
            const result = saveAutoStatusSettings({ autoviewStatus: val === 'on' ? 'true' : 'false' });
            if (!result.success) {
                return xcasper.sendMessage(chatId, { text: `❌ Failed: ${result.error}` }, { quoted: msg });
            }
            return xcasper.sendMessage(chatId, {
                text: `${val === 'on' ? '✅' : '❌'} *Auto View Status: ${val.toUpperCase()}*\n\n_Bot will ${val === 'on' ? 'now automatically view' : 'no longer view'} all WhatsApp statuses._`
            }, { quoted: msg });
        }

        // ── AUTO LIKE STATUS ──────────────────────────────────────────────
        if (sub === 'autolike') {
            const val = args[1]?.toLowerCase();
            if (val !== 'on' && val !== 'off') {
                const st = getAutoStatusSettings();
                const current = st.autoLikeStatus === 'true';
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}set autolike on/off\`\n\n_Currently: ${current ? '✅ ON' : '❌ OFF'}_\n_Like emoji: ${st.statusLikeEmojis}_`
                }, { quoted: msg });
            }
            const result = saveAutoStatusSettings({ autoLikeStatus: val === 'on' ? 'true' : 'false' });
            if (!result.success) {
                return xcasper.sendMessage(chatId, { text: `❌ Failed: ${result.error}` }, { quoted: msg });
            }
            const emoji = getAutoStatusSettings().statusLikeEmojis;
            return xcasper.sendMessage(chatId, {
                text: `${val === 'on' ? '✅' : '❌'} *Auto Like Status: ${val.toUpperCase()}*\n\n_Bot will ${val === 'on' ? `react ${emoji} to` : 'no longer like'} all WhatsApp statuses._`
            }, { quoted: msg });
        }

        // ── SET LIKE EMOJI ────────────────────────────────────────────────
        if (sub === 'likeemoji' || sub === 'statusemoji') {
            const newEmoji = args.slice(1).join(' ').trim();
            if (!newEmoji) {
                const current = getAutoStatusSettings().statusLikeEmojis;
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}set likeemoji <emoji>\`\n\n_Current: ${current}_\n_You can set multiple separated by commas: \`🩵,❤️,🔥\`_`
                }, { quoted: msg });
            }
            const result = saveAutoStatusSettings({ statusLikeEmojis: newEmoji });
            if (!result.success) {
                return xcasper.sendMessage(chatId, { text: `❌ Failed: ${result.error}` }, { quoted: msg });
            }
            return xcasper.sendMessage(chatId, {
                text: `✅ *Like Emoji Updated!*\n\n😊 New emoji: *${newEmoji}*\n\n_Bot will use this when auto-liking statuses._`
            }, { quoted: msg });
        }

        // ── UNKNOWN SUBCOMMAND ────────────────────────────────────────────
        return xcasper.sendMessage(chatId, {
            text: `❓ *Unknown setting:* \`${sub}\`\n\nUse \`${prefix}set\` to see all available options.`
        }, { quoted: msg });
    }
};

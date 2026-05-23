export default {
    name: 'addsudo',
    alias: ['delsudo', 'listsudo', 'sudolist', 'sudo'],
    description: 'Manage sudo users (elevated privileges)',
    category: 'bot',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix, {
        BOT_NAME,
        DEV_NUMBER,
        SUDO_USERS,
        saveSudos,
        loadSudos,
        isDev,
        isOwner,
        jidManager
    }) {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const command = msg.message?.conversation?.trim().split(/\s+/)[0].replace(prefix, '').toLowerCase()
            || msg.message?.extendedTextMessage?.text?.trim().split(/\s+/)[0].replace(prefix, '').toLowerCase()
            || 'sudo';

        const cleanNumber = (input) => {
            if (!input) return null;
            let num = input.replace(/[^0-9]/g, '');
            if (num.startsWith('0') && num.length <= 10) num = '254' + num.slice(1);
            return num;
        };

        const toJid = (number) => `${number}@s.whatsapp.net`;

        const isBotDev = (jid) => {
            const num = jid.split('@')[0].replace(/\D/g, '');
            return num === DEV_NUMBER || jid.includes(DEV_NUMBER);
        };

        const isBotOwner = (jid) => {
            const ownerInfo = jidManager.getOwnerInfo();
            if (!ownerInfo.ownerNumber) return false;
            const num = jid.split('@')[0].replace(/\D/g, '');
            return num === ownerInfo.ownerNumber;
        };

        // ── LISTSUDO ──────────────────────────────────────────────────────
        if (command === 'listsudo' || command === 'sudolist') {
            const sudoSet = SUDO_USERS instanceof Set ? SUDO_USERS : new Set();
            if (sudoSet.size === 0) {
                return xcasper.sendMessage(chatId, {
                    text: `📋 *Sudo List*\n\n_No sudo users added yet._\n\n_Use \`${prefix}addsudo <number>\` to add one._`
                }, { quoted: msg });
            }

            const lines = Array.from(sudoSet).map((jid, i) => {
                const num = jid.split('@')[0];
                return `┃  ${i + 1}. +${num}`;
            }).join('\n');

            return xcasper.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🔐 *SUDO USERS* (${sudoSet.size})\n┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n${lines}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n_Sudo users can use all owner commands._`
            }, { quoted: msg });
        }

        // ── ADDSUDO ───────────────────────────────────────────────────────
        if (command === 'addsudo') {
            const input = args[0];
            if (!input) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}addsudo <number>\`\n\n_Example: \`${prefix}addsudo 254712345678\`_`
                }, { quoted: msg });
            }

            const number = cleanNumber(input);
            if (!number || number.length < 7) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Invalid number:* ${input}\n\n_Provide a full number with country code e.g. 254712345678_`
                }, { quoted: msg });
            }

            const jid = toJid(number);

            if (isBotDev(jid)) {
                return xcasper.sendMessage(chatId, {
                    text: `🛠️ *That's the Dev number — they already have full access.*`
                }, { quoted: msg });
            }

            if (isBotOwner(jid)) {
                return xcasper.sendMessage(chatId, {
                    text: `👑 *That's the Owner number — they already have full access.*`
                }, { quoted: msg });
            }

            if (SUDO_USERS?.has(jid)) {
                return xcasper.sendMessage(chatId, {
                    text: `⚠️ *+${number} is already a sudo user.*`
                }, { quoted: msg });
            }

            if (SUDO_USERS instanceof Set) {
                SUDO_USERS.add(jid);
                saveSudos();
            }

            return xcasper.sendMessage(chatId, {
                text: `✅ *Sudo Added!*\n\n👤 +${number} now has sudo privileges.\n📋 Total sudo users: ${SUDO_USERS?.size ?? 0}\n\n_They can now use all owner-level commands._`
            }, { quoted: msg });
        }

        // ── DELSUDO ───────────────────────────────────────────────────────
        if (command === 'delsudo') {
            const input = args[0];
            if (!input) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}delsudo <number>\`\n\n_Example: \`${prefix}delsudo 254712345678\`_`
                }, { quoted: msg });
            }

            const number = cleanNumber(input);
            if (!number || number.length < 7) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Invalid number:* ${input}`
                }, { quoted: msg });
            }

            const jid = toJid(number);

            if (!SUDO_USERS?.has(jid)) {
                return xcasper.sendMessage(chatId, {
                    text: `⚠️ *+${number} is not in the sudo list.*`
                }, { quoted: msg });
            }

            if (SUDO_USERS instanceof Set) {
                SUDO_USERS.delete(jid);
                saveSudos();
            }

            return xcasper.sendMessage(chatId, {
                text: `✅ *Sudo Removed!*\n\n👤 +${number} has been removed from sudo.\n📋 Remaining sudo users: ${SUDO_USERS?.size ?? 0}`
            }, { quoted: msg });
        }

        // ── HELP (fallback .sudo) ─────────────────────────────────────────
        return xcasper.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  🔐 *SUDO MANAGEMENT*\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n┃  *Commands:*\n┃  ├ ${prefix}addsudo <number>\n┃  ├ ${prefix}delsudo <number>\n┃  └ ${prefix}listsudo\n┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n┃  *Permission Levels:*\n┃  🛠️ Dev — Full access (hardcoded)\n┃  👑 Owner — Full access\n┃  🔐 Sudo — Owner-level commands\n┃  👤 User — Public commands only\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
    }
};

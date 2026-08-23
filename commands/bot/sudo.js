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

        const resolveTargetNumber = async (targetJid) => {
            if (!targetJid) return null;

            const cleaned = jidManager.cleanJid(targetJid);
            if (!cleaned.isLid) return cleanNumber(cleaned.cleanNumber || targetJid);

            let resolvedPhone = globalThis.lidPhoneCache?.get(cleaned.cleanNumber);
            if (!resolvedPhone && chatId.endsWith('@g.us')) {
                try {
                    const metadata = await xcasper.groupMetadata(chatId);
                    const participant = metadata?.participants?.find((entry) =>
                        [entry.id, entry.lid, entry.lidJid].filter(Boolean).some((jid) => jid === targetJid)
                    );
                    resolvedPhone = participant?.phoneNumber || participant?.pn || null;
                } catch {}
            }
            if (!resolvedPhone) {
                try { resolvedPhone = await xcasper.getJidFromLid(targetJid); } catch {}
            }
            if (!resolvedPhone && !chatId.endsWith('@g.us')) {
                resolvedPhone = msg.key.remoteJidAlt || null;
            }

            return cleanNumber(String(resolvedPhone || '').split('@')[0]);
        };

        const getMentionTargetNumber = async () => {
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            return mentionedJid.length ? resolveTargetNumber(mentionedJid[0]) : null;
        };

        const getQuotedTargetNumber = () => {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            if (!contextInfo?.quotedMessage) return null;

            // In a group, WhatsApp supplies the quoted sender in `participant`.
            // In a direct chat that field can be absent, but the DM itself is
            // always with the person whose message was quoted.
            const quotedJid = contextInfo.participant
                || (!chatId.endsWith('@g.us') ? chatId : null);

            if (!quotedJid) return null;
            return resolveTargetNumber(quotedJid);
        };

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
            const number = await getMentionTargetNumber() || cleanNumber(input) || await getQuotedTargetNumber();
            if (!number) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}addsudo <number>\`\n\n_Reply to someone's message in a DM with \`${prefix}addsudo\`, or provide their full number._`
                }, { quoted: msg });
            }

            if (!number || number.length < 7) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Invalid number:* ${input || 'quoted sender'}\n\n_Provide a full number with country code e.g. 254712345678_`
                }, { quoted: msg });
            }

            const jid = toJid(number);
            const existingSudo = Array.from(SUDO_USERS || []).find(
                (sudoJid) => cleanNumber(sudoJid.split('@')[0]) === number
            );

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

            if (existingSudo) {
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
            const number = await getMentionTargetNumber() || cleanNumber(input) || await getQuotedTargetNumber();
            if (!number) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Usage:* \`${prefix}delsudo <number>\`\n\n_Mention, reply to, or provide the sudo user's full number._`
                }, { quoted: msg });
            }

            if (number.length < 7) {
                return xcasper.sendMessage(chatId, {
                    text: `❌ *Invalid number:* ${input || 'selected user'}`
                }, { quoted: msg });
            }

            const storedJid = Array.from(SUDO_USERS || []).find(
                (sudoJid) => cleanNumber(sudoJid.split('@')[0]) === number
            );

            if (!storedJid) {
                return xcasper.sendMessage(chatId, {
                    text: `⚠️ *+${number} is not in the sudo list.*`
                }, { quoted: msg });
            }

            if (SUDO_USERS instanceof Set) {
                SUDO_USERS.delete(storedJid);
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

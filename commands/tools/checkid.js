// commands/tools/checkid.js
// ALICIAH AI - Check ID Command
// Resolve JID from any WhatsApp link, channel, group invite, or phone number
// Powered by CASPER TECH KE

export default {
    name: 'checkid',
    alias: ['id', 'cid', 'jid'],
    description: 'Get the JID/ID of any WhatsApp group link, channel link, message link, or phone number',
    category: 'tools',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

        // ── helpers ──────────────────────────────────────────────────────────

        const cleanPhone = (raw) => raw.replace(/\D/g, '');

        const buildResult = (lines) =>
            lines.join('\n') + '\n\n> checkid  ALICIAH | CASPER TECH';

        // Normalise any WhatsApp URL into { type, value }
        const parseInput = (input) => {
            // Group invite  — chat.whatsapp.com/XxXx
            const groupMatch = input.match(
                /(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i
            );
            if (groupMatch) return { type: 'group', code: groupMatch[1] };

            // Channel / newsletter — whatsapp.com/channel/0Abc…
            const channelMatch = input.match(
                /(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i
            );
            if (channelMatch) return { type: 'channel', id: channelMatch[1] };

            // wa.me/number or wa.me/message/…  (message links carry a phone)
            const wameMsg = input.match(
                /(?:https?:\/\/)?wa\.me\/message\/([A-Za-z0-9_-]+)/i
            );
            if (wameMsg) return { type: 'message_link', token: wameMsg[1] };

            const wame = input.match(
                /(?:https?:\/\/)?wa\.me\/(\d+)/i
            );
            if (wame) return { type: 'phone', number: wame[1] };

            // api.whatsapp.com/send?phone=…
            const apiSend = input.match(
                /(?:https?:\/\/)?api\.whatsapp\.com\/send[?&]phone=(\d+)/i
            );
            if (apiSend) return { type: 'phone', number: apiSend[1] };

            // Plain phone number (7–15 digits, optional + prefix)
            const phone = input.match(/^\+?(\d{7,15})$/);
            if (phone) return { type: 'phone', number: phone[1] };

            return null;
        };

        // ── no args & no quote → show current chat / sender ─────────────────
        if (!args.length && !quotedParticipant) {
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const lines = [
                `🆔 *CHECK ID — ALICIAH AI*\n`,
                `📩 *Your JID:*  \`${senderJid}\``,
            ];
            if (isGroup) {
                lines.push(`👥 *Group JID:* \`${chatId}\``);
            }
            lines.push(
                `\n📝 *Usage:*`,
                `  ${prefix}checkid [link / number]`,
                `  ${prefix}checkid https://chat.whatsapp.com/XXXX`,
                `  ${prefix}checkid https://whatsapp.com/channel/XXXX`,
                `  ${prefix}checkid https://wa.me/254700000000`,
                `  ${prefix}checkid +254700000000`,
                `\n💡 *Or quote any message to get that sender's JID.*`
            );
            await xcasper.sendMessage(chatId, { text: buildResult(lines) }, { quoted: msg });
            return;
        }

        // ── quoted message → return quoted sender JID ────────────────────────
        if (!args.length && quotedParticipant) {
            const lines = [
                `🆔 *CHECK ID — ALICIAH AI*\n`,
                `👤 *Quoted sender JID:* \`${quotedParticipant}\``,
                `📱 *Number:* +${cleanPhone(quotedParticipant.split('@')[0])}`,
                `🏷️  *Type:* ${quotedParticipant.endsWith('@lid') ? 'Linked Device (LID)' : 'Standard Account'}`,
            ];
            await xcasper.sendMessage(chatId, { text: buildResult(lines) }, { quoted: msg });
            return;
        }

        // ── parse the provided input ─────────────────────────────────────────
        const input = args.join('').trim();
        const parsed = parseInput(input);

        if (!parsed) {
            await xcasper.sendMessage(chatId, {
                text: buildResult([
                    `❌ *Unrecognised input:* \`${input}\`\n`,
                    `Supported formats:`,
                    `  • Group link: \`https://chat.whatsapp.com/XXXX\``,
                    `  • Channel link: \`https://whatsapp.com/channel/XXXX\``,
                    `  • Message link: \`https://wa.me/message/XXXX\``,
                    `  • wa.me link: \`https://wa.me/254700000000\``,
                    `  • Phone number: \`+254700000000\``,
                ])
            }, { quoted: msg });
            return;
        }

        await xcasper.sendPresenceUpdate('composing', chatId);
        const loading = await xcasper.sendMessage(chatId, {
            text: `🔍 Resolving ID...\n\n> checkid  ALICIAH | CASPER TECH`
        }, { quoted: msg });

        try {
            // ── GROUP INVITE LINK ─────────────────────────────────────────────
            if (parsed.type === 'group') {
                let groupJid = 'Unknown';
                let groupName = 'Unknown';
                let memberCount = '?';
                let description = '';
                let resolved = false;

                try {
                    const info = await xcasper.groupGetInviteInfo(parsed.code);
                    if (info) {
                        groupJid   = info.id   || 'Unknown';
                        groupName  = info.subject || 'Unknown';
                        memberCount = info.participants?.length ?? '?';
                        description = info.desc || '';
                        resolved = true;
                    }
                } catch (e) {
                    // invite may be revoked or bot not able to resolve
                }

                const lines = [
                    `🆔 *CHECK ID — GROUP LINK*\n`,
                    `🔗 *Invite Code:* \`${parsed.code}\``,
                ];
                if (resolved) {
                    lines.push(
                        `👥 *Group JID:*   \`${groupJid}\``,
                        `📛 *Group Name:*  ${groupName}`,
                        `👤 *Members:*     ${memberCount}`,
                    );
                    if (description) lines.push(`📝 *Description:* ${description.slice(0, 120)}${description.length > 120 ? '…' : ''}`);
                } else {
                    // Derive JID from the invite URL heuristically when API fails
                    lines.push(
                        `⚠️ Could not resolve via API (invite may be expired or private).`,
                        `💡 The group JID can only be confirmed after joining.`
                    );
                }

                await xcasper.sendMessage(chatId, {
                    text: buildResult(lines),
                    edit: loading.key
                });
                return;
            }

            // ── CHANNEL / NEWSLETTER LINK ─────────────────────────────────────
            if (parsed.type === 'channel') {
                let channelJid   = `${parsed.id}@newsletter`;
                let channelName  = 'Unknown';
                let subscribers  = '?';
                let description  = '';
                let invite       = '';
                let resolved     = false;

                try {
                    // type='invite' resolves the invite code → real newsletter metadata
                    const meta = await xcasper.newsletterMetadata('invite', parsed.id);
                    if (meta) {
                        channelJid   = meta.id   ? `${meta.id}@newsletter` : channelJid;
                        channelName  = meta.name || 'Unknown';
                        subscribers  = meta.subscribers ?? '?';
                        description  = meta.description || '';
                        invite       = meta.invite || '';
                        resolved     = true;
                    }
                } catch (_) {}

                const lines = [
                    `🆔 *CHECK ID — CHANNEL LINK*\n`,
                    `📢 *Channel JID:*  \`${channelJid}\``,
                    `🔑 *Channel ID:*   \`${channelJid.split('@')[0]}\``,
                ];
                if (resolved) {
                    lines.push(
                        `📛 *Name:*         ${channelName}`,
                        `👥 *Subscribers:*  ${subscribers}`,
                    );
                    if (description) lines.push(`📝 *Description:*  ${description.slice(0, 120)}${description.length > 120 ? '…' : ''}`);
                    if (invite)      lines.push(`🔗 *Invite Link:*  ${invite}`);
                } else {
                    lines.push(`⚠️ Could not resolve metadata (channel may be private or unavailable).`);
                }

                await xcasper.sendMessage(chatId, {
                    text: buildResult(lines),
                    edit: loading.key
                });
                return;
            }

            // ── WA.ME MESSAGE LINK ────────────────────────────────────────────
            if (parsed.type === 'message_link') {
                const lines = [
                    `🆔 *CHECK ID — MESSAGE LINK*\n`,
                    `🔗 *Token:* \`${parsed.token}\``,
                    `\n⚠️ WhatsApp message links (\`wa.me/message/...\`) encode a short-lived`,
                    `   routing token — they don't expose a JID directly.`,
                    `\n💡 *To get a JID from a message, quote it and run:*`,
                    `   \`${prefix}checkid\``,
                ];
                await xcasper.sendMessage(chatId, {
                    text: buildResult(lines),
                    edit: loading.key
                });
                return;
            }

            // ── PHONE NUMBER ──────────────────────────────────────────────────
            if (parsed.type === 'phone') {
                const number = cleanPhone(parsed.number);
                const jid    = `${number}@s.whatsapp.net`;

                // Check if number is on WhatsApp
                let onWhatsApp = false;
                let resolvedJid = jid;
                try {
                    const [result] = await xcasper.onWhatsApp(number);
                    if (result?.exists) {
                        onWhatsApp  = true;
                        resolvedJid = result.jid || jid;
                    }
                } catch (_) {}

                const lines = [
                    `🆔 *CHECK ID — PHONE NUMBER*\n`,
                    `📱 *Number:*  +${number}`,
                    `🆔 *JID:*     \`${resolvedJid}\``,
                    `✅ *On WhatsApp:* ${onWhatsApp ? 'Yes ✅' : 'Could not confirm ⚠️'}`,
                ];

                await xcasper.sendMessage(chatId, {
                    text: buildResult(lines),
                    edit: loading.key
                });
                return;
            }

        } catch (err) {
            await xcasper.sendMessage(chatId, {
                text: buildResult([
                    `❌ *Error resolving ID*\n`,
                    `${err.message}`,
                ]),
                edit: loading.key
            });
        }
    }
};

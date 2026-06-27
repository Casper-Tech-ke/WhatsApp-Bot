// commands/bot/savestatus.js
// ALICIAH AI - Save / Send Status Command

async function downloadStatus(mediaMsg, mediaType) {
    const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

async function forwardStatus(xcasper, msg, dest) {
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.stickerMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.audioMessage?.contextInfo
        || msg.message?.documentMessage?.contextInfo
        || null;

    if (!ctxInfo?.quotedMessage || ctxInfo?.remoteJid !== 'status@broadcast') {
        return { ok: false, reason: 'not_status' };
    }

    const quotedMsg = ctxInfo.quotedMessage;
    const quotedType = Object.keys(quotedMsg).find(
        k => !['messageContextInfo', 'senderKeyDistributionMessage'].includes(k)
    );
    const mediaMsg = quotedMsg[quotedType];

    const typeMap = {
        imageMessage:    'image',
        videoMessage:    'video',
        audioMessage:    'audio',
        documentMessage: 'document',
        stickerMessage:  'sticker'
    };
    const mediaType = typeMap[quotedType];

    if (mediaType && mediaMsg) {
        const buffer = await downloadStatus(mediaMsg, mediaType);
        let payload;
        if (quotedType === 'imageMessage') {
            payload = { image: buffer, caption: mediaMsg.caption || '' };
        } else if (quotedType === 'videoMessage') {
            payload = { video: buffer, caption: mediaMsg.caption || '', gifPlayback: mediaMsg.gifPlayback || false };
        } else if (quotedType === 'audioMessage') {
            payload = { audio: buffer, mimetype: mediaMsg.mimetype || 'audio/mp4', ptt: mediaMsg.ptt || false };
        } else if (quotedType === 'stickerMessage') {
            payload = { sticker: buffer };
        } else if (quotedType === 'documentMessage') {
            payload = { document: buffer, mimetype: mediaMsg.mimetype, fileName: mediaMsg.fileName || 'file' };
        }
        if (payload) {
            await xcasper.sendMessage(dest, payload);
            return { ok: true };
        }
    }

    const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
    if (text) {
        await xcasper.sendMessage(dest, { text: `📌 *Status:*\n\n${text}` });
        return { ok: true };
    }

    return { ok: false, reason: 'no_content' };
}

export default {
    name: 'savestatus',
    alias: ['save', 'send', 'sendstatus', 'share'],
    description: 'Save or send a quoted WhatsApp status to your DM or current chat',
    category: 'bot',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId    = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        const used      = context?.commandName || 'save';

        const isSend = ['send', 'sendstatus', 'share'].includes(used);

        const dest  = isSend
            ? chatId
            : (senderJid.endsWith('@s.whatsapp.net') ? senderJid : chatId);
        const react = isSend ? '📤' : '💾';

        try {
            const result = await forwardStatus(xcasper, msg, dest);

            if (result.ok) {
                await xcasper.sendMessage(chatId, { react: { text: react, key: msg.key } });
            } else if (result.reason === 'not_status') {
                await xcasper.sendMessage(chatId, {
                    text: `❌ *Reply to a WhatsApp Status first.*\n\n` +
                          `Quote/reply to someone's status, then use:\n` +
                          `• *${prefix}save* — sends it to your DM\n` +
                          `• *${prefix}send* — sends it to this chat`
                }, { quoted: msg });
            }
        } catch (err) {
            await xcasper.sendMessage(chatId, {
                text: `❌ Failed: ${err.message}`
            }, { quoted: msg });
        }
    }
};

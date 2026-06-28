// commands/tools/vv.js
// ALICIAH AI - View-Once Recovery Command
// Reply to a view-once message with .vv or .rvo to save it in the same chat
// Powered by CASPER TECH KE

export default {
    name: 'vv',
    alias: ['rvo', 'viewonce', 'reveal'],
    description: 'Recover a view-once photo/video — reply to it with this command',
    category: 'tools',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;

        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo
            || msg.message?.imageMessage?.contextInfo
            || msg.message?.videoMessage?.contextInfo
            || msg.message?.audioMessage?.contextInfo
            || null;

        if (!ctxInfo?.quotedMessage) {
            await xcasper.sendMessage(chatId, {
                text: `❌ *Reply to a view-once message* with \`${prefix}vv\` to recover it.`
            }, { quoted: msg });
            return;
        }

        const qMsg = ctxInfo.quotedMessage;

        // Unwrap viewOnce layers (WhatsApp sometimes strips the wrapper in quotes)
        const voInner = qMsg.viewOnceMessage?.message
            || qMsg.viewOnceMessageV2?.message
            || qMsg.viewOnceMessageV2Extension?.message;

        const targetMsg = voInner || qMsg;

        const skipKeys = ['messageContextInfo', 'senderKeyDistributionMessage', 'protocolMessage'];
        const innerType = Object.keys(targetMsg).find(k => !skipKeys.includes(k));
        const mediaMsg  = targetMsg[innerType];

        const typeMap = {
            imageMessage: 'image',
            videoMessage: 'video',
            audioMessage: 'audio',
        };
        const mediaType = typeMap[innerType];

        if (!mediaType || !mediaMsg || (!mediaMsg.url && !mediaMsg.directPath)) {
            await xcasper.sendMessage(chatId, {
                text: `❌ No recoverable media found. Make sure you're *replying directly* to the view-once message.`
            }, { quoted: msg });
            return;
        }

        await xcasper.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

        try {
            const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(mediaMsg, mediaType);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);

            const mime = mediaMsg.mimetype || '';
            let payload;

            if (innerType === 'imageMessage') {
                payload = { image: buffer, caption: `🔐 *View-Once recovered*\n> ${context.BOT_NAME}` };
            } else if (innerType === 'videoMessage') {
                payload = {
                    video: buffer,
                    caption: `🔐 *View-Once recovered*\n> ${context.BOT_NAME}`,
                    gifPlayback: mediaMsg.gifPlayback || false
                };
            } else if (innerType === 'audioMessage') {
                payload = { audio: buffer, mimetype: mime || 'audio/mp4', ptt: mediaMsg.ptt || false };
            }

            if (payload) {
                await xcasper.sendMessage(chatId, payload, { quoted: msg });
                await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            }
        } catch (err) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, {
                text: `❌ Failed to recover: ${err.message}`
            }, { quoted: msg });
        }
    }
};

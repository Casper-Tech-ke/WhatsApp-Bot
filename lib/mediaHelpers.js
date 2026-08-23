function getContextInfo(msg) {
    const message = msg?.message || {};
    const content = [
        message.extendedTextMessage,
        message.imageMessage,
        message.videoMessage,
        message.documentMessage,
        message.audioMessage
    ].find(Boolean);
    return content?.contextInfo || null;
}

function unwrapViewOnce(message) {
    return message?.viewOnceMessage?.message
        || message?.viewOnceMessageV2?.message
        || message?.viewOnceMessageV2Extension?.message
        || message;
}

export function getQuotedContextInfo(msg) {
    return getContextInfo(msg);
}

export async function getQuotedImageBuffer(msg) {
    const contextInfo = getContextInfo(msg);
    if (!contextInfo?.quotedMessage) {
        return { ok: false, error: 'Reply to an image with this command.' };
    }

    const imageMessage = unwrapViewOnce(contextInfo.quotedMessage)?.imageMessage;
    if (!imageMessage || (!imageMessage.url && !imageMessage.directPath && !Buffer.isBuffer(imageMessage.buffer))) {
        return { ok: false, error: 'The replied message does not contain a downloadable image.' };
    }

    try {
        if (Buffer.isBuffer(imageMessage.buffer)) {
            return {
                ok: true,
                buffer: imageMessage.buffer,
                mimetype: imageMessage.mimetype || 'image/jpeg'
            };
        }

        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        return {
            ok: true,
            buffer: Buffer.concat(chunks),
            mimetype: imageMessage.mimetype || 'image/jpeg'
        };
    } catch (error) {
        return { ok: false, error: `Could not download the replied image: ${error.message}` };
    }
}
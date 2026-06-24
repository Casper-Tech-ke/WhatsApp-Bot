// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';
import axios from 'axios';

const silentLogger = {
    level: 'silent', trace: () => {}, debug: () => {}, info: () => {},
    warn: () => {}, error: () => {}, fatal: () => {}, child: () => silentLogger
};

async function downloadSticker(xcasper, stickerMessage, contextInfo, chatId) {
    // Build the full WAMessage object the reupload mechanism needs
    const participant = contextInfo?.participant;
    const stanzaId   = contextInfo?.stanzaId;

    const fullMsg = {
        key: {
            remoteJid: chatId,
            id: stanzaId,
            participant: participant || undefined,
            fromMe: false
        },
        message: { stickerMessage }
    };

    // Attempt 1: Baileys downloadMediaMessage with reupload
    try {
        const buf = await downloadMediaMessage(
            fullMsg,
            'buffer',
            {},
            { logger: silentLogger, reuploadRequest: xcasper.updateMediaMessage }
        );
        if (buf && buf.length > 0) return buf;
    } catch {}

    // Attempt 2: direct axios download from the CDN URL
    const url = stickerMessage.url || stickerMessage.directPath;
    if (url) {
        try {
            const res = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 20000,
                headers: { 'User-Agent': 'WhatsApp/2.23.20.0 A' }
            });
            const buf = Buffer.from(res.data);
            if (buf.length > 0) return buf;
        } catch {}
    }

    return null;
}

function buildExif(packName, author, emoji) {
    const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': packName,
        'sticker-pack-publisher': author,
        'emojis': [emoji]
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuf]);
    exif.writeUIntLE(jsonBuf.length, 14, 4);
    return exif;
}

export default {
    name: 'steal',
    alias: ['take', 'clone', 'snatch', 'copysticker'],
    description: 'Steal a sticker and add custom pack name/emoji',
    category: 'sticker',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;

        try {
            const contextInfo    = msg.message?.extendedTextMessage?.contextInfo;
            const quotedMessage  = contextInfo?.quotedMessage;
            const stickerMessage = quotedMessage?.stickerMessage;

            if (!stickerMessage) {
                await xcasper.sendMessage(chatId, {
                    text: `❌ Reply to a sticker to steal it!\n\n*Usage:* ${prefix}take [emoji] [packname] [author]`
                }, { quoted: msg });
                return;
            }

            // Parse args: [emoji] [packName] [author...]
            let emoji    = '🤖';
            let packName = context?.BOT_NAME || 'ALICIAH AI';
            let author   = 'CASPER TECH KE';

            if (args.length > 0) {
                if (/\p{Emoji}/u.test(args[0])) {
                    emoji = args[0];
                    if (args.length > 1) packName = args[1];
                    if (args.length > 2) author = args.slice(2).join(' ');
                } else {
                    packName = args[0];
                    if (args.length > 1) author = args.slice(1).join(' ');
                }
            }

            await xcasper.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

            const stickerBuffer = await downloadSticker(xcasper, stickerMessage, contextInfo, chatId);

            if (!stickerBuffer) {
                await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
                await xcasper.sendMessage(chatId, {
                    text: '❌ Could not download the sticker — it may be too old or unavailable.'
                }, { quoted: msg });
                return;
            }

            // Inject EXIF metadata
            const img = new webp.Image();
            await img.load(stickerBuffer);
            img.exif = buildExif(packName, author, emoji);
            const finalBuffer = await img.save(null);

            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { sticker: finalBuffer }, { quoted: msg });

        } catch (error) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
        }
    }
};

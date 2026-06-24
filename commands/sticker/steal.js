// commands/sticker/steal.js — v4 DEBUG
// ALICIAH AI - Steal Sticker
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';

const silentLogger = {
    level: 'silent', trace: () => {}, debug: () => {}, info: () => {},
    warn: () => {}, error: () => {}, fatal: () => {}, child: () => silentLogger
};

export default {
    name: 'steal',
    alias: ['take', 'clone', 'snatch', 'copysticker'],
    description: 'Steal a sticker and add custom pack name/emoji',
    category: 'sticker',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        let step = 'init';

        try {
            step = 'extract-context';
            const contextInfo    = msg.message?.extendedTextMessage?.contextInfo;
            const quotedMessage  = contextInfo?.quotedMessage;
            const stickerMessage = quotedMessage?.stickerMessage;

            console.log('[STEAL] stickerMessage exists:', !!stickerMessage);
            console.log('[STEAL] updateMediaMessage type:', typeof xcasper.updateMediaMessage);

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

            // Build proper WAMessage for downloadMediaMessage
            const fullMsg = {
                key: {
                    remoteJid: chatId,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant || undefined,
                    fromMe: false
                },
                message: { stickerMessage }
            };

            step = 'download';
            let stickerBuffer = null;

            try {
                console.log('[STEAL] Attempting downloadMediaMessage...');
                stickerBuffer = await downloadMediaMessage(
                    fullMsg, 'buffer', {},
                    { logger: silentLogger, reuploadRequest: xcasper.updateMediaMessage }
                );
                console.log('[STEAL] Download succeeded, size:', stickerBuffer?.length);
            } catch (dlErr) {
                console.error('[STEAL] downloadMediaMessage threw:', dlErr.message);
            }

            if (!stickerBuffer || stickerBuffer.length === 0) {
                await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
                await xcasper.sendMessage(chatId, {
                    text: '❌ Could not download the sticker — the CDN link may have expired.'
                }, { quoted: msg });
                return;
            }

            step = 'load-webp';
            const img = new webp.Image();
            await img.load(stickerBuffer);

            step = 'exif';
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
            img.exif = exif;

            step = 'save';
            const finalBuffer = await img.save(null);

            step = 'send';
            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { sticker: finalBuffer }, { quoted: msg });

        } catch (error) {
            console.error(`[STEAL] Fatal at step "${step}":`, error.message);
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: `❌ Failed at [${step}]: ${error.message}` }, { quoted: msg });
        }
    }
};

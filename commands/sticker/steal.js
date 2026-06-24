// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';

export default {
    name: 'steal',
    alias: ['take', 'clone', 'snatch', 'copysticker'],
    description: 'Steal a sticker and add custom pack name/emoji',
    category: 'sticker',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;

        try {
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const quotedMessage = contextInfo?.quotedMessage;
            const stickerMessage = quotedMessage?.stickerMessage;

            if (!stickerMessage) {
                await xcasper.sendMessage(chatId, { text: '❌ Reply to a sticker to steal it!' }, { quoted: msg });
                return;
            }

            // Parse args: [emoji] [packName] [author...]
            let emoji = '🤖';
            let packName = context?.BOT_NAME || 'ALICIAH AI';
            let author = 'CASPER TECH KE';

            if (args.length > 0) {
                const emojiRegex = /\p{Emoji}/u;
                if (emojiRegex.test(args[0])) {
                    emoji = args[0];
                    if (args.length > 1) packName = args[1];
                    if (args.length > 2) author = args.slice(2).join(' ');
                } else {
                    packName = args[0];
                    if (args.length > 1) author = args.slice(1).join(' ');
                }
            }

            await xcasper.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

            // Build a proper message object for downloadMediaMessage
            const quotedMsg = {
                key: {
                    remoteJid: chatId,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant || undefined,
                    fromMe: false
                },
                message: quotedMessage
            };

            const stickerBuffer = await downloadMediaMessage(
                quotedMsg,
                'buffer',
                {},
                {
                    logger: { level: 'silent', trace: () => {}, debug: () => {}, info: () => {}, warn: () => {}, error: () => {}, fatal: () => {}, child: () => ({}) },
                    reuploadRequest: xcasper.updateMediaMessage
                }
            );

            if (!stickerBuffer || stickerBuffer.length === 0) {
                await xcasper.sendMessage(chatId, { text: '❌ Could not download the sticker. Try again.' }, { quoted: msg });
                return;
            }

            // Inject EXIF metadata
            const img = new webp.Image();
            await img.load(stickerBuffer);

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
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);
            img.exif = exif;

            const finalBuffer = await img.save(null);

            await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            await xcasper.sendMessage(chatId, { sticker: finalBuffer }, { quoted: msg });

        } catch (error) {
            await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await xcasper.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
        }
    }
};

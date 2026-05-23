// commands/converter/tovn.js
// ALICIAH AI - Audio to Voice Note
// Convert any audio or video to WhatsApp voice note (PTT)
// Powered by CASPER TECH KE

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { execSync } from 'child_process';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const randomName = () => randomBytes(8).toString('hex');
const tempDir    = path.join(process.cwd(), 'tmp');

// Stream directly to disk — avoids memory buildup for large files
const streamToFile = (stream, filePath) =>
    new Promise((resolve, reject) => {
        const writer = createWriteStream(filePath);
        stream.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
        stream.on('error', reject);
    });

const getQuotedMedia = (quotedMsg) => {
    if (!quotedMsg) return null;
    if (quotedMsg.audioMessage)
        return { mediaType: 'audio', message: quotedMsg.audioMessage };
    if (quotedMsg.videoMessage)
        return { mediaType: 'video', message: quotedMsg.videoMessage };
    if (quotedMsg.documentMessage) {
        const mime = quotedMsg.documentMessage.mimetype || '';
        if (mime.startsWith('audio/') || mime.startsWith('video/'))
            return { mediaType: 'document', message: quotedMsg.documentMessage };
    }
    return null;
};

const getStreamType = (mediaType, message) => {
    if (mediaType === 'document') {
        const mime = message.mimetype || '';
        return mime.startsWith('video/') ? 'video' : 'audio';
    }
    return mediaType;
};

const toPtt = async (inputFile, outputFile) => {
    // maxBuffer: 100MB — handles files of any practical size
    // -vn strips video track for video inputs
    execSync(
        `ffmpeg -y -i "${inputFile}" -vn -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputFile}"`,
        {
            stdio: 'pipe',
            maxBuffer: 100 * 1024 * 1024
        }
    );
};

const getTypeLabel = (mediaType) =>
    ({ video: '🎬 Video', document: '📄 Document' }[mediaType] || '🎵 Audio');

export default {
    name: 'tovn',
    alias: ['toptt', 'tovoice', 'tovoicenote'],
    description: 'Convert any audio or video to WhatsApp voice note',
    category: 'converter',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg   = contextInfo?.quotedMessage;
        const media       = getQuotedMedia(quotedMsg);

        if (!media) {
            await xcasper.sendMessage(chatId, {
                text: `🎙️ *AUDIO TO VOICE NOTE*\n\n📝 *Usage:* Reply to any of these with *${prefix}tovn*\n\n🎵 Audio messages\n🎬 Videos (audio extracted)\n📄 Audio/video documents\n\n> tovn  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }

        await xcasper.sendPresenceUpdate('recording', chatId);

        const loadingMsg = await xcasper.sendMessage(chatId, {
            text: `🎙️ *Converting ${getTypeLabel(media.mediaType)} to voice note...*\n\n> tovn  ALICIAH | CASPER TECH`
        }, { quoted: msg });

        const inputFile  = path.join(tempDir, `${randomName()}_in`);
        const outputFile = path.join(tempDir, `${randomName()}_out.ogg`);

        try {
            await fs.mkdir(tempDir, { recursive: true });

            // Stream download directly to disk — no memory accumulation
            const streamType = getStreamType(media.mediaType, media.message);
            const stream     = await downloadContentFromMessage(media.message, streamType);
            await streamToFile(stream, inputFile);

            // Verify download
            const { size: inputSize } = await fs.stat(inputFile);
            if (inputSize === 0) throw new Error('Downloaded file is empty');
            console.log(`[tovn] Downloaded: ${(inputSize / 1024).toFixed(1)} KB`);

            // Convert — maxBuffer 100MB handles any practical file size
            await toPtt(inputFile, outputFile);

            // Verify output
            const { size: outputSize } = await fs.stat(outputFile);
            if (outputSize === 0) throw new Error('Converted file is empty');
            console.log(`[tovn] Converted: ${(outputSize / 1024).toFixed(1)} KB`);

            // Read & send as PTT
            const oggBuffer = await fs.readFile(outputFile);

            await xcasper.sendMessage(chatId, {
                audio: oggBuffer,
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: msg });

            await xcasper.sendMessage(chatId, {
                text: `✅ *Voice note ready!*\n\n${getTypeLabel(media.mediaType)} → 🎙️ PTT\n📥 Input: ${(inputSize / 1024).toFixed(1)} KB\n📦 Output: ${(outputSize / 1024).toFixed(1)} KB\n\n> tovn  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });

        } catch (error) {
            console.error('[tovn] Error:', error.message);
            await xcasper.sendMessage(chatId, {
                text: `❌ *Failed:* ${error.message}\n\n> tovn  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        } finally {
            // Always clean up temp files
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
        }
    }
};

// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note
// Convert audio to WhatsApp voice note (PTT)
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

ffmpeg.setFfmpegPath(ffmpegPath);

const randomName = (ext) => {
    const tempDir = path.join(process.cwd(), 'temp');
    return path.join(tempDir, `${Date.now()}_${randomBytes(4).toString('hex')}${ext}`);
};

export default {
    name: 'toptt',
    alias: ['tovoice', 'tovn', 'tovoicenote'],
    description: 'Convert audio to WhatsApp voice note',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedAudio = quotedMessage?.audioMessage;
        
        if (!quotedAudio) {
            await xcasper.sendMessage(chatId, { 
                text: `🎙️ *AUDIO TO VOICE NOTE*\n\n📝 *Usage:* Reply to an audio with: ${prefix}toptt\n\n💡 This converts any audio to a WhatsApp voice note.\n\n> toptt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Converting to voice note...*\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let inputFile = null;
        let outputFile = null;
        
        try {
            await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });
            
            // Download media using baileys
            const messageKey = {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.key.participant || chatId
            };
            
            const mediaBuffer = await downloadMediaMessage(
                {
                    key: messageKey,
                    message: { audioMessage: quotedAudio },
                    messageType: 'audioMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: xcasper.updateMediaMessage
                }
            );
            
            if (!mediaBuffer) {
                throw new Error('Failed to download audio');
            }
            
            inputFile = randomName('.audio');
            outputFile = randomName('.opus');
            
            await fs.writeFile(inputFile, mediaBuffer);
            
            // Convert to opus for voice note
            await new Promise((resolve, reject) => {
                ffmpeg(inputFile)
                    .output(outputFile)
                    .audioCodec('libopus')
                    .audioBitrate('16k')
                    .audioFrequency(16000)
                    .audioChannels(1)
                    .format('ogg')
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('FFmpeg error:', err);
                        reject(err);
                    })
                    .run();
            });
            
            // Verify output file exists and has content
            const stats = await fs.stat(outputFile);
            if (stats.size === 0) {
                throw new Error('Converted file is empty');
            }
            
            const pttBuffer = await fs.readFile(outputFile);
            
            await xcasper.sendMessage(chatId, {
                audio: pttBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            
            // Cleanup
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Voice note ready!*\n\n📦 Size: ${(pttBuffer.length / 1024).toFixed(1)} KB\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Toptt error:', error);
            
            // Cleanup temp files
            if (inputFile) await fs.unlink(inputFile).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

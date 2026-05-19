// commands/converter/toaudio.js
// ALICIAH AI - Video to Audio
// Convert video to MP3 audio
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';

const randomName = (ext) => randomBytes(8).toString('hex') + ext;

export default {
    name: 'toaudio',
    alias: ['tomp3'],
    description: 'Convert video to audio (MP3)',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedVideo = quoted?.videoMessage;
        
        if (!quotedVideo) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *VIDEO TO AUDIO*\n\n📝 *Usage:* Reply to a video with: ${prefix}toaudio\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Converting video to audio...*\n\n> toaudio  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempFilePath = null;
        let outputFile = null;
        
        try {
            const messageKey = msg.quoted?.key || {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.sender
            };
            
            const videoBuffer = await downloadMediaMessage(
                {
                    key: messageKey,
                    message: { videoMessage: quotedVideo },
                    messageType: 'videoMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: xcasper.updateMediaMessage
                }
            );
            
            if (!videoBuffer) throw new Error('Failed to download video');
            
            tempFilePath = randomName('.mp4');
            await fs.writeFile(tempFilePath, videoBuffer);
            
            outputFile = randomName('.mp3');
            
            // Convert using fluent-ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(tempFilePath)
                    .output(outputFile)
                    .noVideo()
                    .audioCodec('libmp3lame')
                    .audioBitrate(128)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });
            
            const audioBuffer = await fs.readFile(outputFile);
            
            await xcasper.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                caption: `🎵 *Converted Audio*\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            await fs.unlink(tempFilePath).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Audio extracted!*\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

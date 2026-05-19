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
        
        // Check if replying to a video
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedVideo = quoted?.videoMessage;
        
        if (!quotedVideo) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *VIDEO TO AUDIO*\n\n📝 *Usage:* Reply to a video message with:\n   • ${prefix}toaudio\n   • ${prefix}tomp3\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Converting video to audio...*\n\nPlease wait...\n\n> toaudio  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempFilePath = null;
        let outputFile = null;
        
        try {
            // Get message key for download
            const messageKey = msg.quoted?.key || {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.sender
            };
            
            // Download the video
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
            
            if (!videoBuffer) {
                throw new Error('Failed to download video');
            }
            
            // Save video to temp file
            tempFilePath = randomName('.mp4');
            await fs.writeFile(tempFilePath, videoBuffer);
            
            outputFile = randomName('.mp3');
            
            // Extract audio using ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(tempFilePath)
                    .noVideo()
                    .audioBitrate(128)
                    .audioFrequency(44100)
                    .toFormat('mp3')
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputFile);
            });
            
            // Read the audio file
            const audioBuffer = await fs.readFile(outputFile);
            
            // Send audio
            await xcasper.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                caption: `🎵 *Converted Audio*\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            // Clean up
            await fs.unlink(tempFilePath).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Audio extracted successfully!*\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('ToAudio error:', error);
            
            // Clean up
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            let errorMsg = "❌ *Failed to extract audio*\n\n";
            if (error.message.includes('no audio')) {
                errorMsg += "This video has no audio track.";
            } else {
                errorMsg += error.message;
            }
            errorMsg += `\n\n> toaudio  ALICIAH | CASPER TECH`;
            
            await xcasper.sendMessage(chatId, { text: errorMsg, edit: loadingMsg.key });
        }
    }
};

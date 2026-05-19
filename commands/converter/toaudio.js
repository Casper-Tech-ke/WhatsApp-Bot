// commands/converter/toaudio.js
// ALICIAH AI - Video/Audio to Audio
// Extract audio from video or convert audio format
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';

const randomName = (ext) => randomBytes(8).toString('hex') + ext;

export default {
    name: 'toaudio',
    alias: ['tomp3', 'extractaudio', 'getaudio'],
    description: 'Extract audio from video or convert audio to MP3',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if replying to a video or audio
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedVideo = quoted?.videoMessage;
        const quotedAudio = quoted?.audioMessage;
        const hasDirectVideo = msg.message?.videoMessage;
        const hasDirectAudio = msg.message?.audioMessage;
        
        if (!quotedVideo && !quotedAudio && !hasDirectVideo && !hasDirectAudio) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *EXTRACT AUDIO*\n\n📝 *Usage:* Reply to a video or audio with:\n   • ${prefix}toaudio\n   • ${prefix}tomp3\n\n🎯 *Output:* MP3 audio file\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Extracting audio...*\n\nPlease wait...\n\n> toaudio  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let inputFile = null;
        let outputFile = null;
        
        try {
            // Get media message
            let mediaMsg = null;
            let isVideo = false;
            
            if (quotedVideo) {
                mediaMsg = quotedVideo;
                isVideo = true;
            } else if (quotedAudio) {
                mediaMsg = quotedAudio;
                isVideo = false;
            } else if (hasDirectVideo) {
                mediaMsg = msg.message.videoMessage;
                isVideo = true;
            } else if (hasDirectAudio) {
                mediaMsg = msg.message.audioMessage;
                isVideo = false;
            }
            
            if (!mediaMsg) {
                throw new Error('No media found');
            }
            
            // Get message key for download
            const messageKey = msg.quoted?.key || {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.sender
            };
            
            // Download media
            const mediaBuffer = await downloadMediaMessage(
                {
                    key: messageKey,
                    message: { [isVideo ? 'videoMessage' : 'audioMessage']: mediaMsg },
                    messageType: isVideo ? 'videoMessage' : 'audioMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: xcasper.updateMediaMessage
                }
            );
            
            if (!mediaBuffer) {
                throw new Error('Failed to download media');
            }
            
            // Save to temp file
            const ext = isVideo ? '.mp4' : '.mp3';
            inputFile = randomName(ext);
            await fs.writeFile(inputFile, mediaBuffer);
            
            outputFile = randomName('.mp3');
            
            // Convert to MP3 using ffmpeg
            await new Promise((resolve, reject) => {
                const command = ffmpeg(inputFile)
                    .toFormat('mp3')
                    .audioBitrate(128)
                    .audioFrequency(44100)
                    .on('end', resolve)
                    .on('error', reject);
                
                if (isVideo) {
                    command.noVideo();
                }
                
                command.save(outputFile);
            });
            
            // Read the audio file
            const audioBuffer = await fs.readFile(outputFile);
            
            // Send as audio
            await xcasper.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                caption: `🎵 *Extracted audio*\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            // Clean up temp files
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Audio extracted successfully!*\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('ToAudio error:', error);
            
            // Clean up temp files
            if (inputFile) await fs.unlink(inputFile).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed to extract audio*\n\n${error.message}\n\nMake sure the video/audio format is supported.\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

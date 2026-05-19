// commands/converter/toaudio.js
// ALICIAH AI - Video to Audio (Debug)
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
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
            // Step 1: Get message key
            console.log('Step 1: Getting message key...');
            const messageKey = msg.quoted?.key || {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.sender
            };
            console.log('Message key:', JSON.stringify(messageKey, null, 2));
            
            // Step 2: Download video
            console.log('Step 2: Downloading video...');
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
            console.log('Video size:', videoBuffer.length, 'bytes');
            
            // Step 3: Save video to temp file
            console.log('Step 3: Saving video to temp file...');
            tempFilePath = randomName('.mp4');
            await fs.writeFile(tempFilePath, videoBuffer);
            console.log('Saved to:', tempFilePath);
            
            outputFile = randomName('.mp3');
            console.log('Output file:', outputFile);
            
            // Step 4: Check if ffmpeg exists
            console.log('Step 4: Checking ffmpeg...');
            try {
                const { stdout } = await execPromise('ffmpeg -version');
                console.log('FFmpeg version:', stdout.split('\n')[0]);
            } catch (ffError) {
                console.error('FFmpeg not found:', ffError.message);
                throw new Error('FFmpeg is not installed on the system');
            }
            
            // Step 5: Convert using ffmpeg
            console.log('Step 5: Converting with ffmpeg...');
            const ffmpegCommand = `ffmpeg -i "${tempFilePath}" -q:a 0 -map a "${outputFile}" -y`;
            console.log('Command:', ffmpegCommand);
            
            const { stdout, stderr } = await execPromise(ffmpegCommand);
            console.log('FFmpeg stdout:', stdout);
            if (stderr) console.log('FFmpeg stderr:', stderr);
            
            // Step 6: Read audio file
            console.log('Step 6: Reading audio file...');
            const audioBuffer = await fs.readFile(outputFile);
            console.log('Audio size:', audioBuffer.length, 'bytes');
            
            // Step 7: Send audio
            console.log('Step 7: Sending audio...');
            await xcasper.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                caption: `🎵 *Converted Audio*\n\n> toaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            // Step 8: Cleanup
            console.log('Step 8: Cleaning up...');
            await fs.unlink(tempFilePath).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            console.log('Step 9: Complete!');
            await xcasper.sendMessage(chatId, {
                text: `✅ *Audio extracted!*\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('=== TOAUDIO ERROR ===');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\nCheck console for details.\n\n> toaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

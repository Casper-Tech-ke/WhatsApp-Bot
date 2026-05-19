// commands/converter/togif.js
// ALICIAH AI - Video/Sticker to GIF
// Convert video or animated sticker to GIF
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const randomName = (ext) => {
    const tempDir = path.join(process.cwd(), 'temp');
    return path.join(tempDir, `${Date.now()}_${randomBytes(4).toString('hex')}${ext}`);
};

export default {
    name: 'togif',
    alias: ['gif', 'videotogif', 'stickertogif'],
    description: 'Convert video or animated sticker to GIF',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedVideo = quoted?.videoMessage;
        const quotedSticker = quoted?.stickerMessage;
        
        if (!quotedVideo && !quotedSticker) {
            await xcasper.sendMessage(chatId, { 
                text: `🎬 *VIDEO/STICKER TO GIF*\n\n📝 *Usage:* Reply to a video or animated sticker with:\n   • ${prefix}togif\n\n> togif  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎬 *Converting to GIF...*\n\n> togif  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempDir = path.join(process.cwd(), 'temp');
        let inputFile = null;
        let fixedFile = null;
        let outputFile = null;
        
        try {
            await fs.mkdir(tempDir, { recursive: true });
            
            let mediaBuffer;
            
            if (quotedVideo) {
                const response = await fetch(quotedVideo.url);
                mediaBuffer = Buffer.from(await response.arrayBuffer());
            } else {
                const response = await fetch(quotedSticker.url);
                mediaBuffer = Buffer.from(await response.arrayBuffer());
            }
            
            inputFile = randomName('.mp4');
            fixedFile = randomName('.mp4');
            outputFile = randomName('.gif');
            
            await fs.writeFile(inputFile, mediaBuffer);
            
            // First, re-encode the video to fix moov atom issue
            await execPromise(`ffmpeg -i "${inputFile}" -c:v libx264 -preset fast -pix_fmt yuv420p -movflags faststart "${fixedFile}" -y`);
            
            // Then convert to GIF
            await execPromise(`ffmpeg -i "${fixedFile}" -vf "fps=10,scale=320:-1:flags=lanczos" -c:v gif -q:v 80 "${outputFile}" -y`);
            
            const gifBuffer = await fs.readFile(outputFile);
            
            await xcasper.sendMessage(chatId, {
                video: gifBuffer,
                gifPlayback: true,
                caption: `🎬 *Converted to GIF*\n\n> togif  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(fixedFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *GIF ready!*\n\n> togif  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Togif error:', error);
            if (inputFile) await fs.unlink(inputFile).catch(() => {});
            if (fixedFile) await fs.unlink(fixedFile).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\n> togif  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

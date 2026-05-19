// commands/sticker/sticker.js
// ALICIAH AI - Convert to Sticker
// Convert image/video to WhatsApp sticker
// Powered by CASPER TECH KE

import axios from 'axios';
import fs from 'fs/promises';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { randomBytes } from 'crypto';

const randomName = (ext) => randomBytes(8).toString('hex') + ext;

export default {
    name: 'sticker',
    alias: ['st', 'make', 'tosticker'],
    description: 'Convert image/video to WhatsApp sticker',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedImg = quoted?.imageMessage;
        const quotedVideo = quoted?.videoMessage;
        
        if (!quotedImg && !quotedVideo) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *CONVERT TO STICKER*\n\n📝 *Usage:* Reply to an image/video with:\n   • ${prefix}sticker\n   • ${prefix}sticker circle\n   • ${prefix}sticker crop\n\n> sticker  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Converting to sticker...*\n\n> sticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            let stickerType = StickerTypes.FULL;
            if (args.includes('circle')) stickerType = StickerTypes.CIRCLE;
            if (args.includes('crop')) stickerType = StickerTypes.CROPPED;
            
            const mediaMsg = quotedImg || quotedVideo;
            const response = await axios.get(mediaMsg.url, { responseType: 'arraybuffer' });
            const mediaBuffer = Buffer.from(response.data);
            
            const tempFile = randomName(quotedImg ? '.jpg' : '.mp4');
            await fs.writeFile(tempFile, mediaBuffer);
            
            const sticker = new Sticker(tempFile, {
                pack: 'ALICIAH AI',
                author: 'CASPER TECH KE',
                type: stickerType,
                quality: 80
            });
            
            const stickerBuffer = await sticker.toBuffer();
            await fs.unlink(tempFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker created!*\n\n> sticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Conversion failed*\n\n${error.message}\n\n> sticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

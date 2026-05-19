// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker
// Take any sticker and change its pack name/author
// Powered by CASPER TECH KE

import axios from 'axios';
import fs from 'fs/promises';
import { Sticker } from 'wa-sticker-formatter';
import { randomBytes } from 'crypto';

const randomName = (ext) => randomBytes(8).toString('hex') + ext;

export default {
    name: 'steal',
    alias: ['take', 'clone', 'snatch'],
    description: 'Steal a sticker and change its pack name/author',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedSticker = quoted?.stickerMessage;
        
        if (!quotedSticker?.url) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STEAL STICKER*\n\n📝 *Usage:* Reply to any sticker with:\n   • ${prefix}steal\n   • ${prefix}steal "My Pack" "My Name"\n   • ${prefix}steal "Custom Pack"\n\n> steal  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Stealing sticker...*\n\n> steal  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            let packName = 'ALICIAH AI';
            let author = 'CASPER TECH KE';
            
            if (args.length > 0) packName = args[0].replace(/["']/g, '');
            if (args.length > 1) author = args.slice(1).join(' ').replace(/["']/g, '');
            
            const response = await axios.get(quotedSticker.url, { responseType: 'arraybuffer' });
            const stickerBuffer = Buffer.from(response.data);
            
            const tempFile = randomName('.webp');
            await fs.writeFile(tempFile, stickerBuffer);
            
            const sticker = new Sticker(tempFile, {
                pack: packName,
                author: author,
                type: 'full',
                quality: 90
            });
            
            const newStickerBuffer = await sticker.toBuffer();
            await fs.unlink(tempFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { sticker: newStickerBuffer }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker stolen!*\n\n📦 *Pack:* ${packName}\n👤 *Author:* ${author}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed to steal sticker*\n\n${error.message}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

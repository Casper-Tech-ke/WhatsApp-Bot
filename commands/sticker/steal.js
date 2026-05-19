// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker } from 'wa-sticker-formatter';

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
        
        if (!quotedSticker || !quotedSticker.url) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ Please reply to a sticker\n\n> steal  ALICIAH | CASPER TECH`
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
            
            // Download with proper headers
            const response = await axios.get(quotedSticker.url, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'WhatsApp/2.23.16.78',
                    'Accept': 'image/webp,image/*,*/*'
                }
            });
            
            let stickerBuffer = Buffer.from(response.data);
            
            // Skip sharp completely - use wa-sticker-formatter directly
            const sticker = new Sticker(stickerBuffer, {
                pack: packName,
                author: author,
                type: 'full',
                categories: ['🎨'],
                quality: 90
            });
            
            const newStickerBuffer = await sticker.toBuffer();
            
            await xcasper.sendMessage(chatId, { sticker: newStickerBuffer }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker stolen!*\n\n📦 *Pack:* ${packName}\n👤 *Author:* ${author}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Steal error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

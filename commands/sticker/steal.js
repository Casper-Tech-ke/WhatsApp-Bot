// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker (Raw Error Display)
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker } from 'wa-sticker-formatter';
import sharp from 'sharp';

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
            
            const response = await axios.get(quotedSticker.url, { responseType: 'arraybuffer' });
            let stickerBuffer = Buffer.from(response.data);
            
            const processedBuffer = await sharp(stickerBuffer).webp({ quality: 90 }).toBuffer();
            
            const sticker = new Sticker(processedBuffer, {
                pack: packName,
                author: author,
                type: 'full',
                quality: 90
            });
            
            const newStickerBuffer = await sticker.toBuffer();
            
            // Try to send and catch the exact WhatsApp/ Baileys error
            try {
                await xcasper.sendMessage(chatId, { sticker: newStickerBuffer }, { quoted: msg });
            } catch (sendError) {
                // This is the RAW Baileys/WhatsApp error
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *RAW WHATSAPP ERROR*\n\n\`\`\`${JSON.stringify(sendError, null, 2)}\`\`\`\n\n> steal  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                return;
            }
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker stolen!*\n\n📦 *Pack:* ${packName}\n👤 *Author:* ${author}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            // Show the error that happened during processing
            await xcasper.sendMessage(chatId, { 
                text: `❌ *PROCESSING ERROR*\n\n\`\`\`${error.message}\`\`\`\n\n${error.stack || ''}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

// commands/sticker/steal.js
// ALICIAH AI - Steal Sticker (Debug Version)
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker } from 'wa-sticker-formatter';
import sharp from 'sharp';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';

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
        
        console.log('=== STEAL COMMAND DEBUG ===');
        console.log('Quoted message:', quoted ? 'Yes' : 'No');
        console.log('Quoted sticker:', quotedSticker ? 'Yes' : 'No');
        console.log('Sticker URL:', quotedSticker?.url ? quotedSticker.url.substring(0, 100) : 'No URL');
        
        if (!quotedSticker || !quotedSticker.url) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STEAL STICKER*\n\n📝 *Usage:* Reply to any sticker with:\n   • ${prefix}steal\n   • ${prefix}steal "My Pack" "My Name"\n\n> steal  ALICIAH | CASPER TECH`
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
            
            console.log('Pack name:', packName);
            console.log('Author:', author);
            console.log('Downloading from URL:', quotedSticker.url);
            
            // Download the sticker
            const response = await axios.get(quotedSticker.url, { 
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            console.log('Downloaded size:', response.data.length, 'bytes');
            
            let stickerBuffer = Buffer.from(response.data);
            
            // Check file type
            const fileType = await fileTypeFromBuffer(stickerBuffer);
            console.log('File type detected:', fileType);
            
            // Save raw downloaded file for inspection
            await fs.writeFile('/tmp/steal-raw.webp', stickerBuffer);
            console.log('Saved raw file to /tmp/steal-raw.webp');
            
            // Try sharp processing
            console.log('Processing with sharp...');
            const processedBuffer = await sharp(stickerBuffer)
                .webp({ quality: 90 })
                .toBuffer();
            
            console.log('Sharp output size:', processedBuffer.length, 'bytes');
            await fs.writeFile('/tmp/steal-sharp.webp', processedBuffer);
            console.log('Saved sharp file to /tmp/steal-sharp.webp');
            
            // Create sticker with wa-sticker-formatter
            console.log('Creating sticker with wa-sticker-formatter...');
            const sticker = new Sticker(processedBuffer, {
                pack: packName,
                author: author,
                type: 'full',
                categories: ['🎨'],
                quality: 90
            });
            
            const newStickerBuffer = await sticker.toBuffer();
            console.log('Final sticker size:', newStickerBuffer.length, 'bytes');
            
            await xcasper.sendMessage(chatId, { sticker: newStickerBuffer }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker stolen!*\n\n📦 *Pack:* ${packName}\n👤 *Author:* ${author}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
            console.log('=== STEAL SUCCESS ===');
            
        } catch (error) {
            console.error('=== STEAL ERROR ===');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // Send error details to chat for debugging
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Steal failed*\n\nError: ${error.message}\n\nCheck console for details.\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

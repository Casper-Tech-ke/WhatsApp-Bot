// commands/sticker/tosticker.js
// ALICIAH AI - Convert Image to Sticker
// Powered by CASPER TECH KE

import axios from 'axios';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

export default {
    name: 'tosticker',
    alias: ['sticker', 's', 'stickerfy'],
    description: 'Convert image to WhatsApp sticker',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Get image from quoted message or direct message
        let mediaMsg = null;
        
        // Direct message
        if (msg.message?.imageMessage) {
            mediaMsg = msg.message.imageMessage;
        } else {
            // Quoted message
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted?.imageMessage) {
                mediaMsg = quoted.imageMessage;
            }
        }
        
        if (!mediaMsg || !mediaMsg.url) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *CONVERT TO STICKER*\n\n📝 *Usage:* Reply to an image with:\n   • ${prefix}tosticker\n   • ${prefix}tosticker circle (for round stickers)\n\n> tosticker  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Converting to sticker...*\n\nPlease wait...\n\n> tosticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Download the image
            const response = await axios.get(mediaMsg.url, { 
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            let imageBuffer = Buffer.from(response.data);
            
            if (!imageBuffer || imageBuffer.length === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            // Detect file type
            const fileType = await fileTypeFromBuffer(imageBuffer);
            console.log('Detected file type:', fileType);
            
            // If it's a WebP sticker, convert it directly
            if (fileType?.mime === 'image/webp') {
                // Just resize and send as sticker
                const webpBuffer = await sharp(imageBuffer)
                    .resize(512, 512, { fit: 'contain', background: '#ffffff' })
                    .webp({ quality: 90 })
                    .toBuffer();
                
                await xcasper.sendMessage(chatId, { sticker: webpBuffer }, { quoted: msg });
            } else {
                // Convert regular image to WebP sticker
                const stickerBuffer = await sharp(imageBuffer)
                    .resize(512, 512, { 
                        fit: 'contain', 
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    })
                    .webp({ quality: 85 })
                    .toBuffer();
                
                await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
            }
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker created!*\n\n> tosticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Sticker conversion error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Conversion failed*\n\n${error.message}\n\nMake sure you reply to a valid image (JPEG, PNG, or WebP).\n\n> tosticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

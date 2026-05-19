// commands/sticker/tosticker.js
// ALICIAH AI - Convert Image/Video to Sticker
// Powered by CASPER TECH KE

import axios from 'axios';
import sharp from 'sharp';

export default {
    name: 'tosticker',
    alias: ['sticker', 's', 'stickerfy'],
    description: 'Convert image or video to WhatsApp sticker',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check for image or video in message or quoted message
        let mediaMsg = null;
        let isVideo = false;
        
        // Direct message
        if (msg.message?.imageMessage) {
            mediaMsg = msg.message.imageMessage;
            isVideo = false;
        } else if (msg.message?.videoMessage) {
            mediaMsg = msg.message.videoMessage;
            isVideo = true;
        } else {
            // Quoted message
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted?.imageMessage) {
                mediaMsg = quoted.imageMessage;
                isVideo = false;
            } else if (quoted?.videoMessage) {
                mediaMsg = quoted.videoMessage;
                isVideo = true;
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
            // Download media
            const response = await axios.get(mediaMsg.url, { 
                responseType: 'arraybuffer',
                timeout: 30000
            });
            let mediaBuffer = Buffer.from(response.data);
            
            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            // Process image with sharp
            let processedBuffer;
            
            if (isVideo) {
                // For videos, use as-is (stickers-formatter will handle)
                processedBuffer = mediaBuffer;
            } else {
                // Process image with sharp
                const image = sharp(mediaBuffer);
                const metadata = await image.metadata();
                
                // Resize to 512x512 (WhatsApp sticker standard)
                processedBuffer = await image
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    })
                    .webp({ quality: 80 })
                    .toBuffer();
            }
            
            // Send as sticker
            await xcasper.sendMessage(chatId, {
                sticker: processedBuffer
            }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker created!*\n\n> tosticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Sticker conversion error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Conversion failed*\n\n${error.message}\n\nTry sending a different image.\n\n> tosticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

// commands/sticker/tosticker.js
// ALICIAH AI - Convert Image/Video to Sticker
// Convert any media to WhatsApp sticker
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker, StickerTypes } from 'stickers-formatter';
import { fileTypeFromBuffer } from 'file-type';

export default {
    name: 'tosticker',
    alias: ['tos', 's', 'stickerfy'],
    description: 'Convert image or video to WhatsApp sticker',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if there's a quoted message or media
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const hasQuotedImage = quoted?.imageMessage;
        const hasQuotedVideo = quoted?.videoMessage;
        const hasDirectImage = msg.message?.imageMessage;
        const hasDirectVideo = msg.message?.videoMessage;
        
        if (!hasQuotedImage && !hasQuotedVideo && !hasDirectImage && !hasDirectVideo) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *CONVERT TO STICKER*\n\n📝 *Usage:* Reply to an image or video with:\n   • ${prefix}tosticker\n   • ${prefix}tosticker circle (for round stickers)\n   • ${prefix}tosticker crop (for cropped stickers)\n\n> tosticker  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Converting to sticker...*\n\nPlease wait...\n\n> tosticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            let mediaBuffer;
            let stickerType = StickerTypes.DEFAULT;
            let isAnimated = false;
            
            // Check for sticker type in args
            if (args.includes('circle')) stickerType = StickerTypes.CIRCLE;
            if (args.includes('crop')) stickerType = StickerTypes.CROPPED;
            if (args.includes('full')) stickerType = StickerTypes.FULL;
            if (args.includes('rounded')) stickerType = StickerTypes.ROUNDED;
            
            // Get the media message
            let mediaMsg = null;
            if (hasQuotedImage) {
                mediaMsg = quoted.imageMessage;
            } else if (hasQuotedVideo) {
                mediaMsg = quoted.videoMessage;
                isAnimated = true;
            } else if (hasDirectImage) {
                mediaMsg = msg.message.imageMessage;
            } else if (hasDirectVideo) {
                mediaMsg = msg.message.videoMessage;
                isAnimated = true;
            }
            
            if (!mediaMsg || !mediaMsg.url) {
                throw new Error('No media URL found');
            }
            
            // Download media from URL
            const response = await axios.get(mediaMsg.url, { 
                responseType: 'arraybuffer',
                timeout: 30000
            });
            mediaBuffer = Buffer.from(response.data);
            
            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            // Check file type
            const fileType = await fileTypeFromBuffer(mediaBuffer);
            console.log('File type:', fileType);
            
            if (!fileType && !isAnimated) {
                // Try to detect by URL
                const urlLower = mediaMsg.url.toLowerCase();
                if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
                    // Assume JPEG
                } else if (urlLower.includes('.png')) {
                    // Assume PNG
                } else {
                    throw new Error('Unsupported file type');
                }
            }
            
            // Create sticker
            const sticker = new Sticker(mediaBuffer, {
                pack: 'ALICIAH AI',
                author: 'CASPER TECH KE',
                type: stickerType,
                categories: ['🎨'],
                quality: 80
            });
            
            const stickerBuffer = await sticker.toBuffer();
            
            // Send as sticker
            await xcasper.sendMessage(chatId, {
                sticker: stickerBuffer
            }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker created!*\n\n🎨 *Type:* ${stickerType}\n✨ *Animated:* ${isAnimated ? 'Yes' : 'No'}\n\n> tosticker  ALICIAH | CASPER TECH`,
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

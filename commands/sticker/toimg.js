// commands/sticker/toimg.js
// ALICIAH AI - Sticker to Image
// Convert sticker back to image (PNG)
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    name: 'toimg',
    alias: ['s2img', 'sticker2img', 'toimage'],
    description: 'Convert sticker back to image',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if replying to a sticker
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedSticker = quoted?.stickerMessage;
        
        if (!quotedSticker) {
            await xcasper.sendMessage(chatId, { 
                text: `🖼️ *STICKER TO IMAGE*\n\n📝 *Usage:* Reply to a sticker with:\n   • ${prefix}toimg\n   • ${prefix}s2img\n\n> toimg  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🖼️ *Converting sticker to image...*\n\n> toimg  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Get the message key for download
            const messageKey = msg.quoted?.key || {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.sender
            };
            
            // Download the sticker using Baileys method
            const stickerBuffer = await downloadMediaMessage(
                {
                    key: messageKey,
                    message: { stickerMessage: quotedSticker },
                    messageType: 'stickerMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: xcasper.updateMediaMessage
                }
            );
            
            if (!stickerBuffer) {
                throw new Error('Failed to download sticker');
            }
            
            // Convert WebP to PNG
            const imageBuffer = await sharp(stickerBuffer)
                .png()
                .toBuffer();
            
            // Send as image
            await xcasper.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🖼️ *Converted sticker to image*\n\n> toimg  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            // Update loading message
            await xcasper.sendMessage(chatId, {
                text: `✅ *Conversion complete!*\n\n> toimg  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('ToImg error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed to convert sticker*\n\n${error.message}\n\n> toimg  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

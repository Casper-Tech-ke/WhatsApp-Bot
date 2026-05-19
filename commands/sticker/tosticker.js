// commands/sticker/tosticker.js
// ALICIAH AI - Convert Image to Sticker
// Convert image/video to WhatsApp sticker
// Powered by CASPER TECH KE

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import fs from 'fs/promises';
import { randomBytes } from 'crypto';

const randomName = (ext) => randomBytes(8).toString('hex') + ext;

export default {
    name: 'tosticker',
    alias: ['sticker', 'st', 'make'],
    description: 'Convert image/video to WhatsApp sticker',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        try {
            // Get quoted message
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedImg = quotedMessage?.imageMessage;
            const quotedVideo = quotedMessage?.videoMessage;
            
            if (!quotedImg && !quotedVideo) {
                await xcasper.sendMessage(chatId, { text: "❌ Reply to an image or video!" }, { quoted: msg });
                return;
            }
            
            let stickerType = StickerTypes.FULL;
            if (args.includes('circle')) stickerType = StickerTypes.CIRCLE;
            if (args.includes('crop')) stickerType = StickerTypes.CROPPED;
            
            const mediaMsg = quotedImg || quotedVideo;
            const isVideo = !!quotedVideo;
            
            // Get message key for download
            const messageKey = {
                remoteJid: chatId,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || msg.key.id,
                participant: msg.sender
            };
            
            // Download media
            const mediaBuffer = await downloadMediaMessage(
                {
                    key: messageKey,
                    message: { [quotedImg ? 'imageMessage' : 'videoMessage']: mediaMsg },
                    messageType: quotedImg ? 'imageMessage' : 'videoMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: xcasper.updateMediaMessage
                }
            );
            
            if (!mediaBuffer) {
                await xcasper.sendMessage(chatId, { text: "❌ Failed to download media" }, { quoted: msg });
                return;
            }
            
            let tempFile = null;
            let stickerBuffer;
            
            if (isVideo) {
                tempFile = randomName('.mp4');
                await fs.writeFile(tempFile, mediaBuffer);
                
                const sticker = new Sticker(tempFile, {
                    pack: 'ALICIAH AI',
                    author: 'CASPER TECH KE',
                    type: stickerType,
                    quality: 80
                });
                
                stickerBuffer = await sticker.toBuffer();
                await fs.unlink(tempFile).catch(() => {});
            } else {
                // Image - use direct buffer
                const sticker = new Sticker(mediaBuffer, {
                    pack: 'ALICIAH AI',
                    author: 'CASPER TECH KE',
                    type: stickerType,
                    quality: 85
                });
                
                stickerBuffer = await sticker.toBuffer();
            }
            
            // Just send the sticker
            await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
            
        } catch (error) {
            console.error('Sticker conversion error:', error);
            await xcasper.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: msg });
        }
    }
};

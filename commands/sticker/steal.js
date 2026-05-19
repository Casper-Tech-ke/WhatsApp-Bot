// commands/sticker/steal.js
// ALICIAH AI - Steal/Clone Sticker
// Take any sticker and change its pack name/author
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker } from 'stickers-formatter';

export default {
    name: 'steal',
    alias: ['take', 'clone', 'getsticker'],
    description: 'Steal a sticker and change its pack name/author',
    category: 'sticker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if replying to a sticker
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const isSticker = quotedMsg?.stickerMessage || msg.message?.stickerMessage;
        
        if (!isSticker) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STEAL STICKER*\n\n📝 *Usage:* Reply to any sticker with:\n   • ${prefix}steal - Use default pack\n   • ${prefix}steal <pack name> - Custom pack name\n   • ${prefix}steal <pack name> <author> - Custom pack & author\n\n💬 *Examples:*\n   • ${prefix}steal\n   • ${prefix}steal My Cool Stickers\n   • ${prefix}steal My Pack My Name\n\n> steal  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Stealing sticker...*\n\nPlease wait...\n\n> steal  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Get the sticker from the quoted message
            const stickerMsg = quotedMsg?.stickerMessage || msg.message?.stickerMessage;
            let stickerUrl = stickerMsg?.url;
            
            // If no direct URL, try to get from direct path
            if (!stickerUrl && stickerMsg?.directPath) {
                stickerUrl = stickerMsg?.url;
            }
            
            if (!stickerUrl) {
                // Try alternative method - download via media key
                const media = await xcasper.downloadMediaMessage(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg);
                if (media) {
                    var mediaBuffer = media;
                } else {
                    throw new Error('Could not get sticker URL');
                }
            } else {
                // Download the sticker
                const response = await axios.get(stickerUrl, { responseType: 'arraybuffer' });
                mediaBuffer = Buffer.from(response.data);
            }
            
            // Parse pack name and author from args
            let packName = 'ALICIAH AI';
            let author = 'CASPER TECH KE';
            
            if (args.length > 0) {
                packName = args[0];
            }
            if (args.length > 1) {
                author = args.slice(1).join(' ');
            }
            
            // Create new sticker with custom pack info
            const sticker = new Sticker(mediaBuffer, {
                pack: packName,
                author: author,
                type: 'default',
                categories: ['🎨', '✨'],
                quality: 90
            });
            
            const stickerMessage = await sticker.toMessage();
            await xcasper.sendMessage(chatId, stickerMessage, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Sticker stolen!*\n\n📦 *Pack:* ${packName}\n👤 *Author:* ${author}\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Sticker steal error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed to steal sticker*\n\n${error.message}\n\nMake sure you reply to a valid sticker.\n\n> steal  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

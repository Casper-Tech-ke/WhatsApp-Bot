// commands/tools/emojimix.js
// ALICIAH AI - EmojiMix Tool
// Mix two emojis and get a combined sticker
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'emojimix',
    alias: ['mix', 'emoji', 'emix', 'emojimash'],
    description: 'Mix two emojis together and get a combined sticker',
    category: 'tools',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        if (!args.length || args.length < 2) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *EMOJIMIX TOOL*\n\n📝 *Usage:* ${prefix}emojimix [emoji1] [emoji2]\n💬 *Example:* ${prefix}emojimix 😪 😭\n\n💡 *Tip:* You need exactly 2 emojis to mix!\n\n> emojimix  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const emoji1 = args[0];
        const emoji2 = args[1];
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Mixing emojis:* ${emoji1} + ${emoji2}\n\n> emojimix  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/tools/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`);
            
            if (response.data?.success && response.data?.mixedEmojiUrl) {
                const result = response.data;
                
                // Download the mixed emoji image
                const imageResponse = await axios.get(result.mixedEmojiUrl, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(imageResponse.data);
                
                // Create sticker from the image buffer
                const sticker = new Sticker(imageBuffer, {
                    pack: 'ALICIAH AI',
                    author: 'CASPER TECH KE',
                    type: StickerTypes.FULL,
                    quality: 90
                });
                
                const stickerBuffer = await sticker.toBuffer();
                
                // Send the sticker
                await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
                
                // Edit the loading message with result details
                let resultText = `🎨 *EMOJIMIX*\n\n`;
                resultText += `${result.emoji1} + ${result.emoji2}\n`;
                if (result.alt) {
                    resultText += `📝 *Name:* ${result.alt.replace(/-/g, ' ')}\n`;
                }
                if (result.date) {
                    resultText += `📅 *Version:* ${result.date}\n`;
                }
                resultText += `\n> emojimix  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, {
                    text: resultText,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *EmojiMix failed*\n\nCould not mix ${emoji1} and ${emoji2}\n\n💡 *Tip:* Try different emoji combinations. Not all emojis can be mixed!\n\n> emojimix  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('EmojiMix error:', error);
            
            let errorMessage = error.message;
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> emojimix  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

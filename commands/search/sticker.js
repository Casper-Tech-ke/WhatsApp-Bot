// commands/search/sticker.js
// ALICIAH AI - Sticker Finder
// Search for animated stickers from GIPHY
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker, StickerTypes } from 'stickers-formatter';

export default {
    name: 'sfind',
    alias: ['sf', 'stickerfind', 'findsticker', 'searchsticker'],
    description: 'Search for animated stickers',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STICKER FINDER*\n\n📝 *Usage:* ${prefix}sfind [search term]\n💬 *Examples:*\n   • ${prefix}sfind funny cats\n   • ${prefix}sf dancing\n\n> sfind  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Searching stickers:* "${query}"\n\n> sfind  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`);
            
            if (response.data?.success && response.data.results?.length) {
                const stickers = response.data.results.slice(0, 5);
                let sentCount = 0;
                
                for (const stickerData of stickers) {
                    try {
                        const imageResponse = await axios.get(stickerData.url, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://giphy.com/'
                            }
                        });
                        
                        const imageBuffer = Buffer.from(imageResponse.data);
                        
                        const sticker = new Sticker(imageBuffer, {
                            pack: 'ALICIAH AI',
                            author: 'CASPER TECH KE',
                            type: StickerTypes.DEFAULT,
                            categories: ['🎨'],
                            quality: 80
                        });
                        
                        const stickerBuffer = await sticker.toBuffer();
                        
                        await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
                        sentCount++;
                        
                        if (sentCount < stickers.length) {
                            await new Promise(resolve => setTimeout(resolve, 800));
                        }
                        
                    } catch (err) {
                        console.error('Sticker conversion failed:', err.message);
                        continue;
                    }
                }
                
                if (sentCount > 0) {
                    await xcasper.sendMessage(chatId, {
                        text: `✅ *Sent ${sentCount} sticker${sentCount > 1 ? 's' : ''} for:* "${query}"\n\n> sfind  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                } else {
                    await xcasper.sendMessage(chatId, {
                        text: `❌ *Failed to convert stickers for:* "${query}"\n\n> sfind  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No stickers found for:* "${query}"\n\n> sfind  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Sticker search error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> sfind  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

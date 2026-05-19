// commands/search/sticker.js
// ALICIAH AI - Sticker Search
// Search for animated stickers from GIPHY
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker, StickerTypes } from 'stickers-formatter';

export default {
    name: 'sticker',
    alias: ['stickersearch', 'findsticker', 's'],
    description: 'Search for animated stickers',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STICKER SEARCH*\n\n📝 *Usage:* ${prefix}sticker [search term]\n💬 *Examples:*\n   • ${prefix}sticker funny cats\n   • ${prefix}s dancing\n\n> sticker  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Searching stickers:* "${query}"\n\n> sticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`);
            
            if (response.data?.success && response.data.results?.length) {
                const stickers = response.data.results.slice(0, 5);
                let sentCount = 0;
                
                for (const stickerData of stickers) {
                    try {
                        // Download the GIF
                        const imageResponse = await axios.get(stickerData.url, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://giphy.com/'
                            }
                        });
                        
                        const imageBuffer = Buffer.from(imageResponse.data);
                        
                        // Convert to sticker using stickers-formatter
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
                        
                        // Delay between stickers
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
                        text: `✅ *Sent ${sentCount} sticker${sentCount > 1 ? 's' : ''} for:* "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                } else {
                    await xcasper.sendMessage(chatId, {
                        text: `❌ *Failed to convert stickers for:* "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No stickers found for:* "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Sticker search error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> sticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

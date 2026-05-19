// commands/search/sticker.js
// ALICIAH AI - Sticker Search
// Find and convert GIFs to WhatsApp stickers using stickers-formatter
// Powered by CASPER TECH KE

import axios from 'axios';
import { Sticker, StickerTypes } from 'stickers-formatter';

export default {
    name: 'sticker',
    alias: ['stickersearch', 'findsticker', 's'],
    description: 'Search for animated stickers and convert to WhatsApp stickers',
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
            text: `🎨 *Searching stickers:* "${query}"\n\nConverting to WhatsApp stickers...\n\n> sticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.results && response.data.results.length > 0) {
                const stickers = response.data.results.slice(0, 5);
                let sentCount = 0;
                
                for (let i = 0; i < stickers.length; i++) {
                    const stickerData = stickers[i];
                    
                    try {
                        // Download the GIF with proper headers to avoid 403
                        const imageResponse = await axios.get(stickerData.url, {
                            responseType: 'arraybuffer',
                            timeout: 15000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://giphy.com/',
                                'Accept': 'image/webp,image/gif,image/*,*/*'
                            }
                        });
                        
                        const imageBuffer = Buffer.from(imageResponse.data);
                        
                        // Create sticker using the class
                        const sticker = new Sticker(imageBuffer, {
                            pack: 'ALICIAH AI',
                            author: 'CASPER TECH KE',
                            type: StickerTypes.DEFAULT,
                            categories: ['🎨'],
                            quality: 80
                        });
                        
                        // Get the message object (as shown in README)
                        const stickerMessage = await sticker.toMessage();
                        
                        // Send using the message object
                        await xcasper.sendMessage(chatId, stickerMessage, { quoted: msg });
                        
                        sentCount++;
                        
                        // Delay between stickers
                        if (i < stickers.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 800));
                        }
                        
                    } catch (stickerError) {
                        console.error(`Sticker ${i + 1} error:`, stickerError.message);
                        
                        // Fallback: send as GIF
                        try {
                            await xcasper.sendMessage(chatId, {
                                video: { url: stickerData.url },
                                gifPlayback: true,
                                caption: `🎨 *${stickerData.title || 'Sticker'}*\n\n> sticker  ALICIAH | CASPER TECH`
                            }, { quoted: msg });
                            sentCount++;
                        } catch (gifError) {
                            console.error(`GIF fallback error:`, gifError.message);
                        }
                    }
                }
                
                // Update loading message
                if (sentCount > 0) {
                    await xcasper.sendMessage(chatId, {
                        text: `✅ *Done!* Sent ${sentCount} sticker${sentCount > 1 ? 's' : ''} for "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                } else {
                    await xcasper.sendMessage(chatId, {
                        text: `❌ *Failed* Could not convert stickers for "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                }
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No stickers found* for "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Sticker Search Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> sticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

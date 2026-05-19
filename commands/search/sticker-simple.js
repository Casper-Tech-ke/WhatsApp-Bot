// commands/search/sticker-simple.js
// ALICIAH AI - Simple Sticker Search
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'stickersimple',
    alias: ['ss', 'sticker2'],
    description: 'Search and send animated stickers',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STICKER SEARCH*\n\n📝 *Usage:* ${prefix}stickersimple [search term]\n💬 *Example:* ${prefix}ss funny cats\n\n> stickersimple  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Searching stickers:* "${query}"\n\n> stickersimple  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success && response.data.results) {
                const stickers = response.data.results.slice(0, 5);
                
                for (const sticker of stickers) {
                    try {
                        await xcasper.sendMessage(chatId, {
                            sticker: { url: sticker.url }
                        }, { quoted: msg });
                    } catch (err) {
                        // If sticker fails, send as video
                        await xcasper.sendMessage(chatId, {
                            video: { url: sticker.url },
                            gifPlayback: true,
                            caption: `🎨 *${sticker.title || 'Sticker'}*\n\n> stickersimple  ALICIAH | CASPER TECH`
                        }, { quoted: msg });
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                
                await xcasper.sendMessage(chatId, {
                    text: `✅ Sent ${stickers.length} stickers for "${query}"\n\n> stickersimple  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ No stickers found for: "${query}"\n\n> stickersimple  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> stickersimple  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

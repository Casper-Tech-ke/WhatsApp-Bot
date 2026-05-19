// commands/search/stickerfind.js
// ALICIAH AI - Find Stickers
// Search for animated stickers from GIPHY
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'stickerfind',
    alias: ['sf', 'findsticker', 'ssearch'],
    description: 'Search for animated stickers/GIFs',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *FIND STICKERS*\n\n📝 *Usage:* ${prefix}stickerfind [search term]\n💬 *Examples:*\n   • ${prefix}stickerfind funny cats\n   • ${prefix}sf dancing\n   • ${prefix}ssearch hello\n\n> stickerfind  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Searching stickers:* "${query}"\n\n> stickerfind  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`);
            
            if (response.data?.success && response.data.results?.length) {
                const stickers = response.data.results.slice(0, 5);
                
                for (const sticker of stickers) {
                    try {
                        await xcasper.sendMessage(chatId, { sticker: { url: sticker.url } }, { quoted: msg });
                    } catch {
                        await xcasper.sendMessage(chatId, {
                            video: { url: sticker.url },
                            gifPlayback: true,
                            caption: `🎨 *${sticker.title || 'Sticker'}*\n\n> stickerfind  ALICIAH | CASPER TECH`
                        }, { quoted: msg });
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Sent ${stickers.length} stickers for:* "${query}"\n\n> stickerfind  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No stickers found for:* "${query}"\n\n> stickerfind  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> stickerfind  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

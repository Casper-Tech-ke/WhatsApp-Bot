// commands/search/sticker-direct.js
// ALICIAH AI - Direct Sticker Search
// Simple GIF to sticker - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'stickers',
    alias: ['sss', 'stickerfind'],
    description: 'Search and send animated stickers',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STICKER SEARCH*\n\n📝 *Usage:* ${prefix}sticker [search term]\n💬 *Example:* ${prefix}sticker funny cat\n\n> sticker  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Searching:* "${query}"\n\n> sticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success && response.data.results) {
                const sticker = response.data.results[0];
                
                if (sticker && sticker.url) {
                    await xcasper.sendMessage(chatId, {
                        sticker: { url: sticker.url }
                    }, { quoted: msg });
                    
                    await xcasper.sendMessage(chatId, {
                        text: `✅ *Sticker sent:* ${sticker.title || query}\n\n> sticker  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                } else {
                    await xcasper.sendMessage(chatId, { 
                        text: `❌ *No sticker found* for "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results* for "${query}"\n\n> sticker  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> sticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

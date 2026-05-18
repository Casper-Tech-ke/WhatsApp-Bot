// commands/search/sticker.js
// ALICIAH AI - Sticker Search
// Find and send animated stickers - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'sticker',
    alias: ['stickersearch', 'findsticker', 's'],
    description: 'Search for animated stickers/GIFs',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *STICKER SEARCH*\n\n📝 *Usage:* ${prefix}sticker [search term]\n💬 *Examples:*\n   • ${prefix}sticker funny cats\n   • ${prefix}s dancing\n   • ${prefix}stickersearch hello\n\n✨ *Features:*\n   • Animated GIF stickers\n   • Can be added to WhatsApp\n   • High-quality stickers\n\n> sticker  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Searching stickers for:* "${query}"\n\nPlease wait...\n\n> sticker  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/stickers?query=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.results && response.data.results.length > 0) {
                const stickers = response.data.results.slice(0, 8);
                let resultText = `🎨 *Sticker Search:* "${query}"\n📊 *Found:* ${response.data.total || stickers.length} stickers\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                // Send each sticker
                for (let i = 0; i < stickers.length; i++) {
                    const sticker = stickers[i];
                    const caption = `🎨 *Sticker ${i+1}/${stickers.length}*\n📝 *${sticker.title || 'Sticker'}*\n${sticker.author ? `👤 *By:* ${sticker.author}\n` : ''}\n\n> sticker  ALICIAH | CASPER TECH`;
                    
                    try {
                        // Try to send as sticker (if supported)
                        await xcasper.sendMessage(chatId, {
                            sticker: { url: sticker.url },
                            caption: caption
                        }, { quoted: msg });
                    } catch (stickerError) {
                        // Fallback to sending as GIF
                        await xcasper.sendMessage(chatId, {
                            video: { url: sticker.url },
                            gifPlayback: true,
                            caption: caption
                        }, { quoted: msg });
                    }
                    
                    // Small delay between stickers
                    if (i < stickers.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
                
                // Update loading message
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Complete!* Found and sent ${stickers.length} stickers for "${query}"\n\n💡 *Tip:* Tap and hold to save to WhatsApp\n\n> sticker  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No stickers found*\n\nNo stickers found for: "${query}"\n\n💡 *Tips:*\n• Try different keywords\n• Use simpler terms\n• Try: ${prefix}sticker [emoji/word]\n\n> sticker  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Sticker Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching stickers*\n\n${error.message}\n\nPlease try again later.\n\n> sticker  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

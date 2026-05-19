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
                text: `🎨 *FIND STICKERS*\n\n📝 *Usage:* ${prefix}stickerfind [search term]\n💬 *Examples:*\n   • ${prefix}stickerfind funny cats\n   • ${prefix}sf dancing\n\n> stickerfind  ALICIAH | CASPER TECH`
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
                        // Download the sticker to buffer first to avoid 403
                        const stickerResponse = await axios.get(sticker.url, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://giphy.com/'
                            }
                        });
                        
                        const stickerBuffer = Buffer.from(stickerResponse.data);
                        
                        // Send as sticker from buffer
                        await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
                        
                    } catch (downloadError) {
                        // Fallback: try thumbnail
                        try {
                            const thumbResponse = await axios.get(sticker.thumbnail, {
                                responseType: 'arraybuffer',
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                            });
                            const thumbBuffer = Buffer.from(thumbResponse.data);
                            await xcasper.sendMessage(chatId, { sticker: thumbBuffer }, { quoted: msg });
                        } catch {
                            // Skip this sticker if both fail
                            continue;
                        }
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
EOFcat > commands/search/stickerfind.js << 'EOF'
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
                text: `🎨 *FIND STICKERS*\n\n📝 *Usage:* ${prefix}stickerfind [search term]\n💬 *Examples:*\n   • ${prefix}stickerfind funny cats\n   • ${prefix}sf dancing\n\n> stickerfind  ALICIAH | CASPER TECH`
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
                        // Download the sticker to buffer first to avoid 403
                        const stickerResponse = await axios.get(sticker.url, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://giphy.com/'
                            }
                        });
                        
                        const stickerBuffer = Buffer.from(stickerResponse.data);
                        
                        // Send as sticker from buffer
                        await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
                        
                    } catch (downloadError) {
                        // Fallback: try thumbnail
                        try {
                            const thumbResponse = await axios.get(sticker.thumbnail, {
                                responseType: 'arraybuffer',
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                            });
                            const thumbBuffer = Buffer.from(thumbResponse.data);
                            await xcasper.sendMessage(chatId, { sticker: thumbBuffer }, { quoted: msg });
                        } catch {
                            // Skip this sticker if both fail
                            continue;
                        }
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
EOFcat > commands/search/stickerfind.js << 'EOF'
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
                text: `🎨 *FIND STICKERS*\n\n📝 *Usage:* ${prefix}stickerfind [search term]\n💬 *Examples:*\n   • ${prefix}stickerfind funny cats\n   • ${prefix}sf dancing\n\n> stickerfind  ALICIAH | CASPER TECH`
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
                        // Download the sticker to buffer first to avoid 403
                        const stickerResponse = await axios.get(sticker.url, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://giphy.com/'
                            }
                        });
                        
                        const stickerBuffer = Buffer.from(stickerResponse.data);
                        
                        // Send as sticker from buffer
                        await xcasper.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
                        
                    } catch (downloadError) {
                        // Fallback: try thumbnail
                        try {
                            const thumbResponse = await axios.get(sticker.thumbnail, {
                                responseType: 'arraybuffer',
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                            });
                            const thumbBuffer = Buffer.from(thumbResponse.data);
                            await xcasper.sendMessage(chatId, { sticker: thumbBuffer }, { quoted: msg });
                        } catch {
                            // Skip this sticker if both fail
                            continue;
                        }
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

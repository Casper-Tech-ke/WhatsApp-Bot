// commands/search/youtube.js
// ALICIAH AI - YouTube Search Command
// WhatsApp Business Compatible - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'youtube',
    alias: ['yt', 'ytsearch'],
    description: 'Search YouTube videos - Powered by CASPER TECH KE',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🔍 *YOUTUBE SEARCH*\n\n📝 *Usage:* ${prefix}youtube [search term]\n💬 *Example:* ${prefix}youtube faded\n\n> youtube  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // Send loading message
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🔍 *Searching YouTube:* "${query}"\n\nPlease wait...\n\n> youtube  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/youtube?query=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success && response.data.videos) {
                const videos = response.data.videos.slice(0, 5);
                
                // Build clean text message with all videos (NO IMAGES)
                let resultText = `🔍 *YouTube Search:* "${query}"\n`;
                resultText += `📊 *Found ${videos.length} videos*\n`;
                resultText += `┌─────────────────┐\n\n`;
                
                videos.forEach((video, index) => {
                    resultText += `${index + 1}. *${video.title}*\n`;
                    resultText += `   📺 ${video.channel}\n`;
                    resultText += `   ⏱️ ${video.duration} | 👁️ ${video.views}\n`;
                    resultText += `   🔗 ${video.url}\n\n`;
                });
                
                resultText += `└─────────────────┘\n`;
                resultText += `> youtube  ALICIAH | CASPER TECH`;
                
                // Send text message only (no images for WhatsApp Business compatibility)
                await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                
                // Update loading message
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Search Complete!* Found ${videos.length} videos for "${query}"\n\n> youtube  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found*\n\nCould not find videos for: "${query}"\n\n> youtube  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('YouTube Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching YouTube*\n\n${error.message}\n\n> youtube  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
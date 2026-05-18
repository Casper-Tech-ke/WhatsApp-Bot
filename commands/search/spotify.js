// commands/search/spotify.js
// ALICIAH AI - Spotify Search Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'spotify',
    alias: ['sp', 'music', 'track'],
    description: 'Search for music on Spotify',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *SPOTIFY SEARCH*\n\n📝 *Usage:* ${prefix}spotify [song name]\n💬 *Example:* ${prefix}spotify faded\n💬 *Example:* ${prefix}spotify Alan Walker\n\n> spotify  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Searching Spotify for:* "${query}"\n\nPlease wait...\n\n> spotify  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Using the WORKING endpoint: spotify-search (not spotify-search2)
            const response = await axios.get(`https://apis.xcasper.space/api/search/spotify-search?q=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.results && response.data.results.length > 0) {
                const results = response.data.results.slice(0, 7);
                let resultText = `🎵 *Spotify Search:* "${query}"\n📊 *Results:* ${response.data.total || results.length} found\n\n`;
                
                results.forEach((track, index) => {
                    resultText += `${index + 1}. *${track.title}*\n`;
                    resultText += `   🎤 Artist: ${track.artist}\n`;
                    if (track.album) resultText += `   💿 Album: ${track.album}\n`;
                    if (track.duration) resultText += `   ⏱️ Duration: ${track.duration}\n`;
                    resultText += `   🎧 ${track.url}\n\n`;
                });
                
                resultText += `> spotify  ALICIAH | CASPER TECH`;
                await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found*\n\nNo tracks found for: "${query}"\n\nPlease try a different search term.\n\n> spotify  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Spotify Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching Spotify*\n\n${error.message}\n\nPlease try again later.\n\n> spotify  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

// commands/search/soundcloud.js
// ALICIAH AI - SoundCloud Search Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'soundcloud',
    alias: ['sc', 'scsearch'],
    description: 'Search for music on SoundCloud',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎧 *SOUNDCLOUD SEARCH*\n\n📝 *Usage:* ${prefix}soundcloud [song name]\n💬 *Example:* ${prefix}soundcloud faded\n💬 *Example:* ${prefix}sc Alan Walker\n\n🎯 *Results:* Track title, artist, plays, likes\n🔗 *Source:* SoundCloud via CASPER TECH KE\n\n> soundcloud  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎧 *Searching SoundCloud for:* "${query}"\n\nPlease wait...\n\n> soundcloud  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/soundcloud?query=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.tracks && response.data.tracks.length > 0) {
                const tracks = response.data.tracks.slice(0, 7);
                let resultText = `🎧 *SoundCloud Search:* "${query}"\n📊 *Results:* ${response.data.totalResults?.toLocaleString() || tracks.length} found\n\n`;
                
                tracks.forEach((track, index) => {
                    // Format play count
                    const plays = track.stats?.playbackCount ? formatNumber(track.stats.playbackCount) : 'N/A';
                    const likes = track.stats?.likesCount ? formatNumber(track.stats.likesCount) : 'N/A';
                    
                    resultText += `${index + 1}. *${track.title}*\n`;
                    resultText += `   🎤 Artist: ${track.artist?.username || 'Unknown'}\n`;
                    resultText += `   ⏱️ Duration: ${track.duration || 'Unknown'}\n`;
                    resultText += `   👂 Plays: ${plays} | ❤️ Likes: ${likes}\n`;
                    if (track.genre && track.genre !== 'Unknown') {
                        resultText += `   🎸 Genre: ${track.genre}\n`;
                    }
                    resultText += `   🎧 ${track.urls?.permalink || '#'}\n\n`;
                });
                
                resultText += `> soundcloud  ALICIAH | CASPER TECH`;
                await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found*\n\nNo tracks found for: "${query}"\n\nPlease try a different search term.\n\n> soundcloud  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('SoundCloud Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching SoundCloud*\n\n${error.message}\n\nPlease try again later.\n\n> soundcloud  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

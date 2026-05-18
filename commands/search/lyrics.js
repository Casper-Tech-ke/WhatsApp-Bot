// commands/search/lyrics.js
// ALICIAH AI - Song Lyrics Search Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'lyrics',
    alias: ['lyric', 'songtext'],
    description: 'Search for song lyrics by title',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📝 *LYRICS SEARCH*\n\n📝 *Usage:* ${prefix}lyrics [song title]\n💬 *Example:* ${prefix}lyrics Faded\n💬 *Example:* ${prefix}lyrics Faded Alan Walker\n\n🎯 *Returns:* Song lyrics with artist info\n\n> lyrics  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📝 *Searching lyrics for:* "${query}"\n\nPlease wait...\n\n> lyrics  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Try with artist if specified, otherwise just title
            const response = await axios.get(`https://apis.xcasper.space/api/search/lyrics?title=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.tracks && response.data.tracks.length > 0) {
                // Find best match (prefer non-instrumental with lyrics)
                let bestMatch = response.data.tracks[0];
                for (const track of response.data.tracks) {
                    if (!track.instrumental && track.plainLyrics && track.plainLyrics.length > 50) {
                        bestMatch = track;
                        break;
                    }
                }
                
                const track = bestMatch;
                const lyrics = track.plainLyrics || track.syncedLyrics || 'Lyrics not available';
                
                // Truncate lyrics if too long (WhatsApp limit)
                let lyricsText = lyrics;
                let truncated = false;
                if (lyricsText.length > 3500) {
                    lyricsText = lyricsText.substring(0, 3500) + '\n\n... (truncated)';
                    truncated = true;
                }
                
                let resultText = `📝 *${track.trackName || track.name || 'Song'}*\n`;
                resultText += `🎤 *Artist:* ${track.artistName || track.artist || 'Unknown'}\n`;
                if (track.albumName && track.albumName !== 'Unknown') {
                    resultText += `💿 *Album:* ${track.albumName}\n`;
                }
                if (track.duration) {
                    const mins = Math.floor(track.duration / 60);
                    const secs = track.duration % 60;
                    resultText += `⏱️ *Duration:* ${mins}:${secs.toString().padStart(2, '0')}\n`;
                }
                resultText += `\n📖 *Lyrics:*\n━━━━━━━━━━━━━━━━━━━━━━\n${lyricsText}\n━━━━━━━━━━━━━━━━━━━━━━\n`;
                
                if (truncated) {
                    resultText += `\n⚠️ *Lyrics truncated due to length*\n`;
                }
                resultText += `\n> lyrics  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No lyrics found*\n\nNo lyrics found for: "${query}"\n\n💡 Tips:\n• Try using just the song title\n• Check spelling\n• Try a different song\n\n> lyrics  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Lyrics Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching lyrics*\n\n${error.message}\n\nPlease try again later.\n\n> lyrics  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

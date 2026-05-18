// commands/search/lyrics2.js
// ALICIAH AI - Enhanced Song Lyrics Search
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'lyrics2',
    alias: ['l2', 'lyrics2', 'songtext2'],
    description: 'Search for song lyrics with timestamps and artwork',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📝 *LYRICS SEARCH V2*\n\n📝 *Usage:* ${prefix}lyrics2 [song title] by [artist]\n💬 *Examples:*\n   • ${prefix}lyrics2 Faded by Alan Walker\n   • ${prefix}lyrics2 Shape of You\n   • ${prefix}lyrics2 Bohemian Rhapsody\n\n✨ *Features:*\n   • 🎵 Synced lyrics with timestamps\n   • 🖼️ Album artwork\n   • 📡 Multiple sources\n\n> lyrics2  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📝 *Searching lyrics for:* "${query}"\n\nPlease wait...\n\n> lyrics2  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/google-lyrics?q=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.lyrics) {
                const title = response.data.title || 'Song';
                const artist = response.data.artist || 'Unknown';
                let lyricsText = response.data.syncedLyrics || response.data.lyrics;
                const artwork = response.data.artwork;
                const source = response.data.source || 'Unknown';
                const totalSources = response.data.totalSources || 0;
                
                // Truncate if too long
                let truncated = false;
                if (lyricsText.length > 3500) {
                    lyricsText = lyricsText.substring(0, 3500) + '\n\n... (lyrics truncated)';
                    truncated = true;
                }
                
                let resultText = `🎵 *${title}*\n`;
                resultText += `🎤 *Artist:* ${artist}\n`;
                resultText += `📡 *Source:* ${source}`;
                if (totalSources > 1) resultText += ` + ${totalSources - 1} more sources`;
                resultText += `\n\n📖 *Lyrics:*\n━━━━━━━━━━━━━━━━━━━━━━\n${lyricsText}\n━━━━━━━━━━━━━━━━━━━━━━\n`;
                
                if (truncated) {
                    resultText += `\n⚠️ *Lyrics truncated due to length*\n`;
                }
                resultText += `\n> lyrics2  ALICIAH | CASPER TECH`;
                
                // Send with artwork if available
                if (artwork) {
                    try {
                        await xcasper.sendMessage(chatId, {
                            image: { url: artwork },
                            caption: resultText
                        }, { quoted: msg });
                    } catch (imgError) {
                        await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
                    }
                } else {
                    await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No lyrics found*\n\nNo lyrics found for: "${query}"\n\n💡 *Tips:*\n• Try format: "song by artist"\n• Check spelling\n• Try using: ${prefix}lyrics [song name]\n\n> lyrics2  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Lyrics2 Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching lyrics*\n\n${error.message}\n\nPlease try again later.\n\n> lyrics2  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

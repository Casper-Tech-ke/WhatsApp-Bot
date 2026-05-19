// commands/downloader/spotifyplay.js
// ALICIAH AI - Spotify Play
// Search and play the top Spotify track
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'spotifyplay',
    alias: ['spdl', 'spd', 'splay'],
    description: 'Search and play the top Spotify track',
    category: 'downloader',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *SPOTIFY PLAY*\n\n📝 *Usage:* ${prefix}spotifyplay [song name]\n💬 *Example:* ${prefix}spotifyplay faded\n💬 *Example:* ${prefix}play Alan Walker\n\n> spotifyplay  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Searching and playing:* "${query}"\n\n> spotifyplay  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Step 1: Search for the track
            const searchResponse = await axios.get(`https://apis.xcasper.space/api/search/spotify-search?q=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (searchResponse.data?.success && searchResponse.data.results?.length > 0) {
                const topTrack = searchResponse.data.results[0];
                const spotifyUrl = topTrack.url;
                
                // Step 2: Download the track
                const downloadResponse = await axios.get(`https://apis.xcasper.space/api/downloader/sportify?url=${encodeURIComponent(spotifyUrl)}`);
                
                if (downloadResponse.data?.success && downloadResponse.data.track) {
                    const track = downloadResponse.data.track;
                    const audioUrl = track.audio?.url;
                    const cover = track.album?.cover || track.thumbnail;
                    const title = track.title;
                    const artist = track.artist;
                    const duration = track.duration;
                    
                    // Send cover image
                    if (cover) {
                        await xcasper.sendMessage(chatId, {
                            image: { url: cover },
                            caption: `🎵 *Now Playing:* ${title}\n🎤 *Artist:* ${artist}\n⏱️ *Duration:* ${duration}\n\n> spotifyplay  ALICIAH | CASPER TECH`
                        }, { quoted: msg });
                    }
                    
                    // Download and send audio
                    const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                    const audioBuffer = Buffer.from(audioResponse.data);
                    
                    await xcasper.sendMessage(chatId, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        caption: `🎵 *${title} - ${artist}*\n\n> spotifyplay  ALICIAH | CASPER TECH`
                    }, { quoted: msg });
                    
                    await xcasper.sendMessage(chatId, {
                        text: `✅ *Now playing:* ${title} by ${artist}\n\n> spotifyplay  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                    
                } else {
                    await xcasper.sendMessage(chatId, { 
                        text: `❌ *Failed to download track*\n\n> spotifyplay  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found for:* "${query}"\n\n> spotifyplay  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Spotify Play error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> spotifyplay  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

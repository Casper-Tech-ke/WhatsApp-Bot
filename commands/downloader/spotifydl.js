// commands/downloader/spotifydl.js
// ALICIAH AI - Spotify Downloader
// Download audio from Spotify tracks
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'spotifydl',
    alias: ['spdl', 'sptrack', 'spotifydownload'],
    description: 'Download audio from Spotify tracks',
    category: 'downloader',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *SPOTIFY DOWNLOADER*\n\n📝 *Usage:* ${prefix}spotifydl [Spotify URL]\n💬 *Example:* ${prefix}spotifydl https://open.spotify.com/track/0eWzZsRGvfzaCb9ioMCoBG\n\n> spotifydl  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        let url = args[0];
        
        // Validate Spotify URL
        if (!url.includes('open.spotify.com/track/')) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid URL*\n\nPlease provide a valid Spotify track URL.\n\n> spotifydl  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Fetching track...*\n\n> spotifydl  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/downloader/sportify?url=${encodeURIComponent(url)}`);
            
            if (response.data?.success && response.data.track) {
                const track = response.data.track;
                const audioUrl = track.audio?.url;
                const cover = track.album?.cover || track.thumbnail;
                const title = track.title;
                const artist = track.artist;
                const duration = track.duration;
                
                // Send cover image first
                if (cover) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: cover },
                        caption: `🎵 *${title}*\n🎤 *Artist:* ${artist}\n⏱️ *Duration:* ${duration}\n\n> spotifydl  ALICIAH | CASPER TECH`
                    }, { quoted: msg });
                }
                
                // Download audio
                const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);
                
                // Send audio
                await xcasper.sendMessage(chatId, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    caption: `🎵 *${title} - ${artist}*\n\n> spotifydl  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Download complete!*\n\n🎵 *${title}*\n🎤 *${artist}*\n\n> spotifydl  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Failed to fetch track*\n\nPlease check the URL and try again.\n\n> spotifydl  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Spotify download error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> spotifydl  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

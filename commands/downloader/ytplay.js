// commands/downloader/ytplay.js
// ALICIAH AI - YouTube Play
// Search and play the top YouTube result as audio
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ytplay',
    alias: ['play', 'yplay', 'ytp'],
    description: 'Search and play the top YouTube result as audio',
    category: 'downloader',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *YOUTUBE PLAY*\n\n📝 *Usage:* ${prefix}ytplay [song/video name]\n💬 *Example:* ${prefix}ytplay faded alan walker\n💬 *Example:* ${prefix}play shape of you\n\n> ytplay  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Searching and playing:* "${query}"\n\n> ytplay  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Step 1: Search for the video
            const searchResponse = await axios.get(`https://apis.xcasper.space/api/search/youtube?query=${encodeURIComponent(query)}`);
            
            if (searchResponse.data?.success && searchResponse.data.videos?.length > 0) {
                const topVideo = searchResponse.data.videos[0];
                const videoUrl = topVideo.url;
                const videoTitle = topVideo.title;
                const channel = topVideo.channel;
                const duration = topVideo.duration;
                
                // Step 2: Download audio from the video
                const audioResponse = await axios.get(`https://apis.xcasper.space/api/downloader/ytmp5?url=${encodeURIComponent(videoUrl)}`);
                
                if (audioResponse.data?.success) {
                    const audioUrl = audioResponse.data.url;
                    const quality = audioResponse.data.quality;
                    const title = audioResponse.data.title || videoTitle;
                    
                    // Download audio buffer
                    const audioDownload = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                    const audioBuffer = Buffer.from(audioDownload.data);
                    
                    // Send audio
                    await xcasper.sendMessage(chatId, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        caption: `🎵 *Now Playing:* ${title}\n🎤 *Channel:* ${channel}\n⏱️ *Duration:* ${duration}\n📊 *Quality:* ${quality}\n\n> ytplay  ALICIAH | CASPER TECH`
                    }, { quoted: msg });
                    
                    await xcasper.sendMessage(chatId, {
                        text: `✅ *Now playing:* ${title}\n\n> ytplay  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                    
                } else {
                    await xcasper.sendMessage(chatId, { 
                        text: `❌ *Failed to download audio*\n\n> ytplay  ALICIAH | CASPER TECH`,
                        edit: loadingMsg.key
                    });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found for:* "${query}"\n\n> ytplay  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('YT Play error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> ytplay  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

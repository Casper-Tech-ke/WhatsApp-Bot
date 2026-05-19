// commands/downloader/ytaudio.js
// ALICIAH AI - YouTube Audio Downloader
// Download audio from YouTube videos with metadata
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ytaudio',
    alias: ['ytmp3', 'yta', 'youtubemp3'],
    description: 'Download audio from YouTube videos',
    category: 'downloader',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *YOUTUBE AUDIO DOWNLOADER*\n\n📝 *Usage:* ${prefix}ytaudio [YouTube URL]\n💬 *Example:* ${prefix}ytaudio https://youtube.com/watch?v=3Lo8HBwOrQM\n\n> ytaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        let url = args[0];
        
        // Validate YouTube URL
        if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid URL*\n\nPlease provide a valid YouTube video URL.\n\n> ytaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Fetching audio...*\n\n> ytaudio  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/downloader/ytmp5?url=${encodeURIComponent(url)}`);
            
            if (response.data?.success) {
                const title = response.data.title;
                const quality = response.data.quality;
                const format = response.data.format;
                const audioUrl = response.data.url;
                const filename = response.data.filename;
                
                // Download audio
                const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                const audioBuffer = Buffer.from(audioResponse.data);
                
                // Send audio with metadata in caption
                await xcasper.sendMessage(chatId, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    caption: `🎵 *${title}*\n📊 *Quality:* ${quality}\n📁 *Format:* ${format}\n\n> ytaudio  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Audio downloaded!*\n\n🎵 *${title}*\n📊 *Quality:* ${quality}\n\n> ytaudio  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Failed to fetch audio*\n\nPlease check the URL and try again.\n\n> ytaudio  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('YouTube Audio error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> ytaudio  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

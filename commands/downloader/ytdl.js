// commands/downloader/ytdl.js
// ALICIAH AI - YouTube Audio/Video Downloader
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ytdl',
    alias: ['ytdownload', 'youtube-dl', 'ytmp3', 'audio', 'mp3'],
    description: 'Download YouTube videos or extract audio',
    category: 'downloader',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📥 *YOUTUBE DOWNLOADER*\n\n` +
                      `📝 *Usage:* ${prefix}ytdl [YouTube URL]\n` +
                      `💬 *Example:* ${prefix}ytdl https://youtube.com/watch?v=60ItHLz5WEA\n\n` +
                      `🎵 *Downloads:*\n` +
                      `   • MP3 Audio (128kbps)\n` +
                      `   • MP4 Video (1080p, 720p, 360p)\n\n` +
                      `> ytdl  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        let url = args[0];
        
        // Validate URL
        if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid URL*\n\nPlease provide a valid YouTube video URL.\n\n> ytdl  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // First, fetch video info
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📥 *Fetching video info...*\n\n🔗 ${url}\n⏳ Please wait...\n\n> ytdl  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Call the YouTube Downloader API
            const response = await axios.get(`https://apis.xcasper.space/api/downloader/yt-dl?url=${encodeURIComponent(url)}`);
            
            if (response.data && response.data.success) {
                const video = response.data;
                const medias = response.data.medias || [];
                
                // Find audio format
                const audioFormat = medias.find(m => m.formatId === '140' || m.formatId === '18' || (m.type === 'video' && m.is_audio === true)) || medias[0];
                
                // Find video formats
                const videoFormats = medias.filter(m => m.type === 'video' && m.ext === 'mp4');
                const bestQuality = videoFormats.find(f => f.quality === 'mp4 (1080p)') || videoFormats.find(f => f.quality === 'mp4 (720p)');
                const mediumQuality = videoFormats.find(f => f.quality === 'mp4 (720p)');
                const lowQuality = videoFormats.find(f => f.quality === 'mp4 (360p)');
                
                // Update loading message with choice
                await xcasper.sendMessage(chatId, {
                    text: `📥 *${video.title || 'YouTube Video'}*\n\n` +
                          `⏱️ *Duration:* ${formatDuration(video.duration)}\n` +
                          `🎯 *Available:* Audio + Video\n\n` +
                          `*Choose download type:*\n` +
                          `1️⃣ Send Audio (MP3)\n` +
                          `2️⃣ Send Video (Best Quality)\n` +
                          `3️⃣ Send Video + Download Links\n\n` +
                          `_Reply with 1, 2, or 3 within 30 seconds_\n\n` +
                          `> ytdl  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
                // Wait for user response
                const choice = await waitForResponse(xcasper, chatId, msg.key.participant || msg.key.remoteJid, 30000);
                
                if (!choice) {
                    await xcasper.sendMessage(chatId, { 
                        text: `⏰ *Timeout!*\n\nPlease try again and respond within 30 seconds.\n\n> ytdl  ALICIAH | CASPER TECH`
                    }, { quoted: msg });
                    return;
                }
                
                // Process based on choice
                if (choice === '1') {
                    // Send AUDIO only
                    await sendAudio(xcasper, chatId, audioFormat, video);
                } 
                else if (choice === '2') {
                    // Send VIDEO (best quality)
                    await sendVideo(xcasper, chatId, bestQuality, video);
                }
                else if (choice === '3') {
                    // Send VIDEO + links
                    await sendVideoWithLinks(xcasper, chatId, bestQuality, mediumQuality, lowQuality, video);
                }
                else {
                    await xcasper.sendMessage(chatId, { 
                        text: `❌ *Invalid choice!*\n\nPlease use 1, 2, or 3.\n\n> ytdl  ALICIAH | CASPER TECH`
                    }, { quoted: msg });
                }
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Download failed*\n\nCould not fetch video information. Please check the URL.\n\n> ytdl  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('YouTube Downloader Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\nPlease try again later.\n\n> ytdl  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};

// Function to wait for user response
async function waitForResponse(xcasper, chatId, senderJid, timeout) {
    return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
            resolve(null);
        }, timeout);
        
        const handler = (msg) => {
            const msgChatId = msg.key.remoteJid;
            const msgSender = msg.key.participant || msg.key.remoteJid;
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            
            if (msgChatId === chatId && msgSender === senderJid && text.match(/^[123]$/)) {
                clearTimeout(timeoutId);
                xcasper.ev.off('messages.upsert', handler);
                resolve(text);
            }
        };
        
        xcasper.ev.on('messages.upsert', handler);
        
        // Cleanup after timeout
        setTimeout(() => {
            xcasper.ev.off('messages.upsert', handler);
        }, timeout + 1000);
    });
}

// Send audio only
async function sendAudio(xcasper, chatId, audioFormat, video) {
    const loadingMsg = await xcasper.sendMessage(chatId, { 
        text: `🎵 *Downloading audio...*\n\nPlease wait...\n\n> ytdl  ALICIAH | CASPER TECH`
    });
    
    try {
        const audioResponse = await axios.get(audioFormat.url, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(audioResponse.data);
        
        await xcasper.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            caption: `🎵 *${video.title || 'YouTube Audio'}*\n⏱️ Duration: ${formatDuration(video.duration)}\n\n> ytdl  ALICIAH | CASPER TECH`
        });
        
        await xcasper.sendMessage(chatId, {
            text: `✅ *Audio sent!* Enjoy listening 🎧\n\n> ytdl  ALICIAH | CASPER TECH`,
            edit: loadingMsg.key
        });
    } catch (error) {
        await xcasper.sendMessage(chatId, { 
            text: `❌ *Audio download failed:* ${error.message}\n\n> ytdl  ALICIAH | CASPER TECH`
        });
    }
}

// Send video only
async function sendVideo(xcasper, chatId, videoFormat, video) {
    const loadingMsg = await xcasper.sendMessage(chatId, { 
        text: `📹 *Downloading video...*\n\nPlease wait...\n\n> ytdl  ALICIAH | CASPER TECH`
    });
    
    try {
        const videoResponse = await axios.get(videoFormat.url, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data);
        
        await xcasper.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `📹 *${video.title || 'YouTube Video'}*\n⏱️ Duration: ${formatDuration(video.duration)}\n🎯 Quality: ${videoFormat.quality}\n\n> ytdl  ALICIAH | CASPER TECH`
        });
        
        await xcasper.sendMessage(chatId, {
            text: `✅ *Video sent!* Enjoy watching 📺\n\n> ytdl  ALICIAH | CASPER TECH`,
            edit: loadingMsg.key
        });
    } catch (error) {
        await xcasper.sendMessage(chatId, { 
            text: `❌ *Video download failed:* ${error.message}\n\n> ytdl  ALICIAH | CASPER TECH`
        });
    }
}

// Send video + download links
async function sendVideoWithLinks(xcasper, chatId, bestQuality, mediumQuality, lowQuality, video) {
    // First send the best quality video
    const loadingMsg = await xcasper.sendMessage(chatId, { 
        text: `📹 *Downloading video...*\n\nPlease wait...\n\n> ytdl  ALICIAH | CASPER TECH`
    });
    
    try {
        const videoResponse = await axios.get(bestQuality.url, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data);
        
        await xcasper.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `📹 *${video.title || 'YouTube Video'}*\n⏱️ Duration: ${formatDuration(video.duration)}\n🎯 Quality: ${bestQuality.quality}\n\n> ytdl  ALICIAH | CASPER TECH`
        });
        
        // Then send download links
        let linksText = `📥 *Download Links for:* ${video.title}\n\n`;
        if (bestQuality) linksText += `🎬 *${bestQuality.quality}*: ${bestQuality.url}\n`;
        if (mediumQuality) linksText += `📱 *${mediumQuality.quality}*: ${mediumQuality.url}\n`;
        if (lowQuality) linksText += `📱 *${lowQuality.quality}*: ${lowQuality.url}\n`;
        linksText += `\n💡 *Click link to download in browser*\n\n> ytdl  ALICIAH | CASPER TECH`;
        
        await xcasper.sendMessage(chatId, { text: linksText });
        
        await xcasper.sendMessage(chatId, {
            text: `✅ *Complete!* Video sent + download links provided\n\n> ytdl  ALICIAH | CASPER TECH`,
            edit: loadingMsg.key
        });
    } catch (error) {
        await xcasper.sendMessage(chatId, { 
            text: `❌ *Video download failed:* ${error.message}\n\n> ytdl  ALICIAH | CASPER TECH`
        });
    }
}

function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
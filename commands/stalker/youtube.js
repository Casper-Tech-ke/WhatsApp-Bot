// commands/stalker/youtube.js
// ALICIAH AI - YouTube Stalker
// Get detailed YouTube channel information with stats
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ytstalk',
    alias: ['syoutube', 'syt', 'sytb', 'ytsk'],
    description: 'Get YouTube channel information with stats',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Check for just a number (not applicable for YouTube, but kept for consistency)
        const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const isNumberOnly = textMsg && /^\d+$/.test(textMsg.trim());
        
        if (isNumberOnly) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid command*\n\nPlease use ${prefix}ytstalk [username] to search for a channel.\n\n> ytstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        // Normal profile lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `▶️ *YOUTUBE STALKER*\n\n📝 *Usage:* ${prefix}ytstalk [username]\n💬 *Example:* ${prefix}ytstalk Casper.tech.254\n\n> ytstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const username = args[0].replace('@', ''); // Remove @ if user includes it
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `▶️ *Fetching YouTube channel:* ${username}\n\n> ytstalk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/youtube?username=${encodeURIComponent(username)}`);
            
            if (response.data?.success) {
                const profile = response.data.profile;
                const stats = response.data.stats;
                
                let resultText = `▶️ *YOUTUBE CHANNEL*\n\n`;
                resultText += `👤 *Username:* @${profile.username}\n`;
                resultText += `📛 *Channel Name:* ${profile.name || 'Not set'}\n`;
                resultText += `🆔 *Channel ID:* ${profile.channel_id}\n`;
                
                if (profile.description) {
                    resultText += `📝 *Description:* ${profile.description.substring(0, 200)}${profile.description.length > 200 ? '...' : ''}\n`;
                }
                
                if (profile.country) {
                    resultText += `🌍 *Country:* ${profile.country}\n`;
                }
                
                if (profile.joined) {
                    resultText += `📅 *Joined:* ${profile.joined}\n`;
                }
                
                resultText += `\n📊 *STATISTICS*\n`;
                
                if (stats.subscribers_hidden) {
                    resultText += `👥 *Subscribers:* Hidden 🔒\n`;
                } else {
                    resultText += `👥 *Subscribers:* ${stats.subscribers_formatted}\n`;
                }
                
                resultText += `🎬 *Videos:* ${stats.videos_formatted}\n`;
                resultText += `👁️ *Views:* ${stats.views_formatted}\n\n`;
                
                // External links
                if (profile.external_links && profile.external_links.length > 0) {
                    resultText += `🔗 *EXTERNAL LINKS*\n`;
                    profile.external_links.forEach((link, index) => {
                        resultText += `${index + 1}. ${link}\n`;
                    });
                    resultText += `\n`;
                }
                
                resultText += `🔗 *Channel:* ${profile.channel_url}\n\n`;
                resultText += `> ytstalk  ALICIAH | CASPER TECH`;
                
                // Send avatar first if available
                if (profile.avatar) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: profile.avatar },
                        caption: resultText
                    }, { quoted: msg });
                } else {
                    await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                }
                
                // Send banner if available
                if (profile.banner) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: profile.banner },
                        caption: `🎨 *Channel Banner for @${profile.username}*\n\n> ytstalk  ALICIAH | CASPER TECH`
                    }, { quoted: msg });
                }
                
                // Edit loading message to show success
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Channel fetched for:* @${username}\n\n👥 Subscribers: ${stats.subscribers_hidden ? 'Hidden' : stats.subscribers_formatted} | 🎬 Videos: ${stats.videos_formatted} | 👁️ Views: ${stats.views_formatted}\n\n> ytstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Channel not found*\n\nCould not find YouTube channel: @${username}\n\n💡 Make sure the username is correct.\n\n> ytstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('YouTube stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `Channel "@${username}" not found`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> ytstalk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

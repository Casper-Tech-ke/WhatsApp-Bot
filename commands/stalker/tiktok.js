// commands/stalker/tiktok.js
// ALICIAH AI - TikTok Stalker
// Get detailed TikTok profile information with account stats
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ttsk',
    alias: ['tiktokstalk', 'ttstalk', 'tikstalk', 'tikstalk', 'tks'],
    description: 'Get TikTok profile information with account stats',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Check for just a number (not applicable for TikTok currently, but kept for consistency)
        const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const isNumberOnly = textMsg && /^\d+$/.test(textMsg.trim());
        
        if (isNumberOnly) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid command*\n\nPlease use ${prefix}ttsk [username] to search for a profile.\n\n> ttsk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        // Normal profile lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎵 *TIKTOK STALKER*\n\n📝 *Usage:* ${prefix}ttsk [username]\n💬 *Example:* ${prefix}ttsk cristiano\n\n> ttsk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const username = args[0].replace('@', ''); // Remove @ if user includes it
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎵 *Fetching TikTok profile:* ${username}\n\n> ttsk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/tiktok?username=${encodeURIComponent(username)}`);
            
            if (response.data?.success) {
                const profile = response.data.profile;
                const stats = response.data.stats;
                const accountInfo = response.data.account_info;
                
                let resultText = `🎵 *TIKTOK PROFILE*\n\n`;
                resultText += `👤 *Username:* @${profile.username}\n`;
                resultText += `📛 *Nickname:* ${profile.nickname || 'Not set'}\n`;
                resultText += `🆔 *User ID:* ${profile.id}\n`;
                
                if (profile.bio) {
                    resultText += `📝 *Bio:* ${profile.bio.substring(0, 200)}\n`;
                }
                
                resultText += `\n📊 *STATISTICS*\n`;
                resultText += `👥 *Followers:* ${stats.followers_formatted}\n`;
                resultText += `👣 *Following:* ${stats.following_formatted}\n`;
                resultText += `🎬 *Videos:* ${stats.videos_formatted}\n`;
                resultText += `❤️ *Total Likes:* ${stats.likes_formatted}\n`;
                resultText += `📈 *Avg Likes/Video:* ${stats.avg_likes_formatted}\n`;
                resultText += `📊 *Engagement Rate:* ${stats.engagement_rate}\n\n`;
                
                resultText += `🔐 *ACCOUNT INFO*\n`;
                resultText += `✅ *Verified:* ${accountInfo.verified ? 'Yes ✅' : 'No ❌'}\n`;
                resultText += `🔒 *Private:* ${accountInfo.private ? 'Yes 🔒' : 'No'}\n`;
                resultText += `🔞 *Under 18:* ${accountInfo.is_under_18 ? 'Yes' : 'No'}\n`;
                resultText += `⭐ *Open Favorite:* ${accountInfo.open_favorite ? 'Yes' : 'No'}\n`;
                
                if (profile.created_at) {
                    resultText += `\n📅 *Account Created:* ${new Date(profile.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}\n`;
                }
                
                // Social links
                if (profile.social_links) {
                    const links = profile.social_links;
                    const hasLinks = links.instagram || links.twitter || links.youtube_channel;
                    
                    if (hasLinks) {
                        resultText += `\n🔗 *SOCIAL LINKS*\n`;
                        if (links.instagram) resultText += `📸 Instagram: ${links.instagram}\n`;
                        if (links.twitter) resultText += `🐦 Twitter: ${links.twitter}\n`;
                        if (links.youtube_channel) resultText += `▶️ YouTube: ${links.youtube_channel}\n`;
                    }
                }
                
                resultText += `\n🔗 *Profile:* ${profile.profile_url}\n\n`;
                resultText += `> ttsk  ALICIAH | CASPER TECH`;
                
                // Send avatar first if available
                if (profile.avatar) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: profile.avatar },
                        caption: resultText
                    }, { quoted: msg });
                } else {
                    await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                }
                
                // Edit loading message to show success
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Profile fetched for:* @${username}\n\n📊 Followers: ${stats.followers_formatted} | Videos: ${stats.videos_formatted}\n\n> ttsk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Profile not found*\n\nCould not find TikTok user: @${username}\n\n💡 Make sure the username is correct.\n\n> ttsk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('TikTok stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `Profile "@${username}" not found`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> ttsk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

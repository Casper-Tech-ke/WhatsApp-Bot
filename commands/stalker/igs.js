// commands/stalker/igs.js
// ALICIAH AI - Instagram Stalker
// Get detailed Instagram profile information with recent posts
// Powered by CASPER TECH KE

import axios from 'axios';

// Store for user sessions
const userSessions = new Map();

export default {
    name: 'igs',
    alias: ['instagram', 'stalk', 'igstalk', 'igst'],
    description: 'Get Instagram profile information with recent posts',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Check if this is a number reply (no command, just a number)
        const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const isNumberOnly = textMsg && /^\d+$/.test(textMsg.trim());
        
        // If user sent just a number, check if they have an active session
        if (isNumberOnly) {
            const postNumber = parseInt(textMsg.trim()) - 1;
            const session = userSessions.get(sender);
            
            if (session && session.recent_posts && session.recent_posts[postNumber]) {
                const post = session.recent_posts[postNumber];
                
                let postText = `📸 *POST DETAILS*\n\n`;
                postText += `🔗 *Shortcode:* ${post.shortcode}\n`;
                postText += `📹 *Type:* ${post.is_video ? 'Video' : 'Image'}\n`;
                postText += `❤️ *Likes:* ${post.likes}\n`;
                postText += `💬 *Comments:* ${post.comments}\n`;
                if (post.views) postText += `👁️ *Views:* ${post.views}\n`;
                postText += `📅 *Posted:* ${new Date(post.posted_at).toLocaleString()}\n\n`;
                if (post.description && post.description.trim()) {
                    postText += `📝 *Caption:*\n${post.description.substring(0, 300)}${post.description.length > 300 ? '...' : ''}\n\n`;
                }
                postText += `🔗 *Instagram:* https://www.instagram.com/p/${post.shortcode}/\n\n`;
                postText += `> igs  ALICIAH | CASPER TECH`;
                
                if (post.thumbnail) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: post.thumbnail },
                        caption: postText
                    }, { quoted: msg });
                } else if (post.download_url && !post.is_video) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: post.download_url },
                        caption: postText
                    }, { quoted: msg });
                } else if (post.is_video && post.download_url) {
                    await xcasper.sendMessage(chatId, {
                        video: { url: post.download_url },
                        caption: postText
                    }, { quoted: msg });
                } else {
                    await xcasper.sendMessage(chatId, { text: postText }, { quoted: msg });
                }
                return;
            } else {
                const maxPosts = session?.recent_posts?.length || 5;
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Invalid post number*\n\nPlease select a number from 1-${maxPosts}.\n\n> igs  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                return;
            }
        }
        
        // Normal profile lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📸 *INSTAGRAM STALKER*\n\n📝 *Usage:* ${prefix}igs [username]\n💬 *Example:* ${prefix}igs sam\n\n> igs  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const username = args[0];
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📸 *Fetching Instagram profile:* ${username}\n\n> igs  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/ig?username=${encodeURIComponent(username)}`);
            
            if (response.data?.success) {
                const profile = response.data.profile;
                const stats = response.data.stats;
                const accountInfo = response.data.account_info;
                const recentPosts = response.data.recent_posts || [];
                
                let resultText = `📸 *INSTAGRAM PROFILE*\n\n`;
                resultText += `👤 *Username:* ${profile.username}\n`;
                resultText += `📛 *Full Name:* ${profile.full_name || 'Not set'}\n`;
                resultText += `🆔 *User ID:* ${profile.id}\n\n`;
                
                resultText += `📊 *STATISTICS*\n`;
                resultText += `👥 *Followers:* ${stats.followers_formatted}\n`;
                resultText += `👣 *Following:* ${stats.following_formatted}\n`;
                resultText += `📷 *Posts:* ${stats.posts_formatted}\n`;
                resultText += `❤️ *Avg Likes:* ${stats.avg_likes_formatted}\n`;
                resultText += `💬 *Avg Comments:* ${stats.avg_comments_formatted}\n`;
                resultText += `📈 *Engagement Rate:* ${stats.engagement_rate}\n\n`;
                
                resultText += `🔐 *ACCOUNT INFO*\n`;
                resultText += `✅ *Verified:* ${accountInfo.is_verified ? 'Yes' : 'No'}\n`;
                resultText += `🔒 *Private:* ${accountInfo.is_private ? 'Yes' : 'No'}\n`;
                resultText += `💼 *Business:* ${accountInfo.is_business ? 'Yes' : 'No'}\n`;
                resultText += `🎬 *Has Clips:* ${accountInfo.has_clips ? 'Yes' : 'No'}\n\n`;
                
                if (profile.biography) {
                    resultText += `📝 *Bio:* ${profile.biography.substring(0, 200)}\n\n`;
                }
                
                // Show recent posts
                if (recentPosts.length > 0) {
                    resultText += `📸 *RECENT POSTS*\n`;
                    recentPosts.slice(0, 5).forEach((post, index) => {
                        const typeIcon = post.is_video ? '🎬' : '🖼️';
                        resultText += `${index + 1}. ${typeIcon} ${post.likes} likes | ${post.comments} comments\n`;
                    });
                    resultText += `\n💡 *Send a number (e.g., "2") to view that post*\n\n`;
                }
                
                resultText += `> igs  ALICIAH | CASPER TECH`;
                
                // Store recent posts for this user
                userSessions.set(sender, { recent_posts: recentPosts });
                
                // Send profile picture first if available
                if (profile.profile_pic) {
                    await xcasper.sendMessage(chatId, {
                        image: { url: profile.profile_pic },
                        caption: resultText
                    }, { quoted: msg });
                } else {
                    await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                }
                
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Profile fetched for:* ${username}\n\n📸 *Send a number (1-${Math.min(5, recentPosts.length)}) to view a post!*\n\n> igs  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Profile not found*\n\nCould not find Instagram user: ${username}\n\n> igs  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Instagram stalker error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> igs  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

// commands/stalker/github.js
// ALICIAH AI - GitHub Stalker
// Get detailed GitHub profile information with repositories and activity
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ghstalk',
    alias: ['github', 'gh', 'gitstalk', 'ghs'],
    description: 'Get GitHub profile information with repositories and activity',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Check for just a number (not applicable for GitHub, but kept for consistency)
        const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const isNumberOnly = textMsg && /^\d+$/.test(textMsg.trim());
        
        if (isNumberOnly) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid command*\n\nPlease use ${prefix}ghstalk [username] to search for a profile.\n\n> ghstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        // Normal profile lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🐙 *GITHUB STALKER*\n\n📝 *Usage:* ${prefix}ghstalk [username]\n💬 *Example:* ${prefix}ghstalk Casper-Tech-ke\n\n> ghstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const username = args[0];
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🐙 *Fetching GitHub profile:* ${username}\n\n> ghstalk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/github?username=${encodeURIComponent(username)}`);
            
            if (response.data?.success) {
                const profile = response.data.profile;
                const stats = response.data.stats;
                const languages = response.data.languages || [];
                const topRepos = response.data.top_repositories || [];
                const recentActivity = response.data.recent_activity || [];
                
                let resultText = `🐙 *GITHUB PROFILE*\n\n`;
                resultText += `👤 *Username:* ${profile.username}\n`;
                resultText += `📛 *Name:* ${profile.name || 'Not set'}\n`;
                resultText += `🆔 *User ID:* ${profile.id}\n`;
                resultText += `👔 *Type:* ${profile.type}\n`;
                
                if (profile.bio) {
                    resultText += `📝 *Bio:* ${profile.bio.substring(0, 200)}\n`;
                }
                
                if (profile.company) {
                    resultText += `🏢 *Company:* ${profile.company}\n`;
                }
                
                if (profile.location) {
                    resultText += `📍 *Location:* ${profile.location}\n`;
                }
                
                if (profile.blog) {
                    resultText += `🌐 *Website:* ${profile.blog}\n`;
                }
                
                if (profile.twitter) {
                    resultText += `🐦 *Twitter:* @${profile.twitter}\n`;
                }
                
                if (profile.email) {
                    resultText += `📧 *Email:* ${profile.email}\n`;
                }
                
                resultText += `💼 *Hireable:* ${profile.hireable ? 'Yes ✅' : 'No ❌'}\n`;
                
                resultText += `\n📊 *STATISTICS*\n`;
                resultText += `👥 *Followers:* ${stats.followers_formatted}\n`;
                resultText += `👣 *Following:* ${stats.following_formatted}\n`;
                resultText += `📁 *Public Repos:* ${stats.public_repos}\n`;
                resultText += `📝 *Public Gists:* ${stats.public_gists}\n`;
                resultText += `⭐ *Total Stars:* ${stats.total_stars_formatted}\n`;
                resultText += `🍴 *Total Forks:* ${stats.total_forks_formatted}\n`;
                
                // Languages
                if (languages.length > 0) {
                    resultText += `\n💻 *LANGUAGES*\n`;
                    resultText += `${languages.join(', ')}\n`;
                }
                
                // Top Repositories
                if (topRepos.length > 0) {
                    resultText += `\n📚 *TOP REPOSITORIES*\n`;
                    topRepos.slice(0, 5).forEach((repo, index) => {
                        resultText += `${index + 1}. *${repo.name}*\n`;
                        resultText += `   📝 ${repo.description ? repo.description.substring(0, 80) + (repo.description.length > 80 ? '...' : '') : 'No description'}\n`;
                        resultText += `   ⭐ ${repo.stars_formatted} | 🍴 ${repo.forks_formatted}`;
                        if (repo.language) resultText += ` | 🔤 ${repo.language}`;
                        resultText += `\n`;
                    });
                }
                
                // Recent Activity
                if (recentActivity.length > 0) {
                    resultText += `\n📅 *RECENT ACTIVITY*\n`;
                    const uniqueActivity = [...new Set(recentActivity.map(a => a.repo))].slice(0, 5);
                    uniqueActivity.forEach((repo, index) => {
                        const activity = recentActivity.find(a => a.repo === repo);
                        const typeIcon = activity.type === 'PushEvent' ? '📤' : activity.type === 'CreateEvent' ? '🆕' : activity.type === 'WatchEvent' ? '⭐' : '🔄';
                        resultText += `${index + 1}. ${typeIcon} ${repo}\n`;
                    });
                }
                
                resultText += `\n🔗 *Profile:* ${profile.profile_url}\n\n`;
                resultText += `📅 *Created:* ${new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}\n\n`;
                resultText += `> ghstalk  ALICIAH | CASPER TECH`;
                
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
                    text: `✅ *Profile fetched for:* ${username}\n\n📊 Repos: ${stats.public_repos} | ⭐ Stars: ${stats.total_stars_formatted} | 👥 Followers: ${stats.followers_formatted}\n\n> ghstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Profile not found*\n\nCould not find GitHub user: ${username}\n\n💡 Make sure the username is correct (case-sensitive).\n\n> ghstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('GitHub stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `User "${username}" not found`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> ghstalk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

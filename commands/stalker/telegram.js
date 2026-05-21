// commands/stalker/telegram.js
// ALICIAH AI - Telegram Stalker
// Get detailed Telegram profile/channel/bot information
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'tgstalk',
    alias: ['telegramstalk', 'stg', 'telestalk', 'tgs'],
    description: 'Get Telegram profile, channel or bot information',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Check for just a number (not applicable for Telegram, but kept for consistency)
        const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const isNumberOnly = textMsg && /^\d+$/.test(textMsg.trim());
        
        if (isNumberOnly) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid command*\n\nPlease use ${prefix}tgstalk [username] to search for a profile.\n\n> tgstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        // Normal profile lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `✈️ *TELEGRAM STALKER*\n\n📝 *Usage:* ${prefix}tgstalk [username]\n💬 *Example:* ${prefix}tgstalk casper_tech_ke\n\n> tgstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const username = args[0].replace('@', ''); // Remove @ if user includes it
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `✈️ *Fetching Telegram profile:* ${username}\n\n> tgstalk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/telegram?username=${encodeURIComponent(username)}`);
            
            if (response.data?.success) {
                const profile = response.data.profile;
                const stats = response.data.stats;
                
                // Determine type emoji
                let typeEmoji = '👤';
                let typeLabel = 'Profile';
                if (profile.type === 'bot') {
                    typeEmoji = '🤖';
                    typeLabel = 'Bot';
                } else if (profile.type === 'channel') {
                    typeEmoji = '📢';
                    typeLabel = 'Channel';
                } else if (profile.type === 'group') {
                    typeEmoji = '👥';
                    typeLabel = 'Group';
                }
                
                let resultText = `✈️ *TELEGRAM ${typeLabel.toUpperCase()}*\n\n`;
                resultText += `👤 *Username:* @${profile.username}\n`;
                resultText += `📛 *Title:* ${profile.title || 'Not set'}\n`;
                resultText += `🏷️ *Type:* ${typeEmoji} ${typeLabel}\n`;
                
                if (profile.description) {
                    resultText += `📝 *Description:* ${profile.description.substring(0, 200)}${profile.description.length > 200 ? '...' : ''}\n`;
                }
                
                resultText += `\n📊 *STATISTICS*\n`;
                resultText += `👥 *Members/Subscribers:* ${stats.members_formatted}\n`;
                
                if (stats.raw_extra) {
                    resultText += `📋 *Extra Info:* ${stats.raw_extra}\n`;
                }
                
                resultText += `\n🔗 *Profile:* ${profile.profile_url}\n\n`;
                resultText += `> tgstalk  ALICIAH | CASPER TECH`;
                
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
                    text: `✅ *${typeLabel} fetched for:* @${username}\n\n👥 Members: ${stats.members_formatted} | 🏷️ Type: ${typeLabel}\n\n> tgstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Profile not found*\n\nCould not find Telegram profile: @${username}\n\n💡 Make sure the username is correct.\n\n> tgstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Telegram stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `Profile "@${username}" not found`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> tgstalk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

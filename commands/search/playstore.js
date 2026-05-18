// commands/search/playstore.js
// ALICIAH AI - Google Play Store Search
// Find apps on Google Play - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'playstore',
    alias: ['play', 'googleplay', 'app'],
    description: 'Search for apps on Google Play Store',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📱 *GOOGLE PLAY STORE SEARCH*\n\n📝 *Usage:* ${prefix}playstore [app name]\n💬 *Examples:*\n   • ${prefix}playstore whatsapp\n   • ${prefix}play instagram\n   • ${prefix}googleplay spotify\n\n📊 *Returns:* App name, developer, rating, download link\n\n> playstore  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📱 *Searching Play Store for:* "${query}"\n\nPlease wait...\n\n> playstore  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/playstore?query=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.results && response.data.results.length > 0) {
                const apps = response.data.results.slice(0, 5);
                let resultText = `📱 *Play Store Search:* "${query}"\n📊 *Found:* ${response.data.total || apps.length} apps\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                apps.forEach((app, index) => {
                    // Parse rating from text (e.g., "Rated 4.5 stars out of five stars")
                    let rating = app.rating || 'N/A';
                    if (app.name && app.name.includes('Rated')) {
                        const match = app.name.match(/Rated ([\d.]+) stars/);
                        if (match) rating = match[1];
                    }
                    
                    resultText += `${index + 1}. 📱 *${app.developer || 'App'}*\n`;
                    if (app.developer) resultText += `   👨‍💻 *Developer:* ${app.developer}\n`;
                    resultText += `   ⭐ *Rating:* ${rating} / 5.0\n`;
                    resultText += `   🔗 *Download:* ${app.url}\n\n`;
                });
                
                resultText += `> playstore  ALICIAH | CASPER TECH`;
                
                // Send first app icon if available
                if (apps[0].icon) {
                    try {
                        await xcasper.sendMessage(chatId, {
                            image: { url: apps[0].icon },
                            caption: resultText
                        }, { quoted: msg });
                    } catch (imgError) {
                        await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
                    }
                } else {
                    await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
                }
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No apps found*\n\nNo apps found for: "${query}"\n\n💡 *Tips:*\n• Try a different app name\n• Check spelling\n• Try: ${prefix}playstore [app name]\n\n> playstore  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Play Store Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching Play Store*\n\n${error.message}\n\nPlease try again later.\n\n> playstore  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

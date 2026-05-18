// commands/search/apkpure.js
// ALICIAH AI - APKPure App Search
// Find APK files and Android apps - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'apkpure',
    alias: ['apk', 'android', 'apksearch'],
    description: 'Search for APK files and Android apps on APKPure',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📦 *APKPURE APP SEARCH*\n\n📝 *Usage:* ${prefix}apkpure [app name]\n💬 *Examples:*\n   • ${prefix}apkpure minecraft\n   • ${prefix}apk whatsapp\n   • ${prefix}android spotify\n\n📊 *Returns:* App name, developer, rating, version, size, download link\n\n> apkpure  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📦 *Searching APKPure for:* "${query}"\n\nPlease wait...\n\n> apkpure  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/apkpure?q=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.results && response.data.results.length > 0) {
                const apps = response.data.results.slice(0, 7);
                let resultText = `📦 *APKPure Search:* "${query}"\n📊 *Found:* ${response.data.total || apps.length} apps\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                apps.forEach((app, index) => {
                    const rating = parseFloat(app.rating) || 0;
                    const ratingStars = getRatingStars(rating);
                    
                    resultText += `${index + 1}. 📱 *${app.name || 'Unknown'}*\n`;
                    if (app.developer && app.developer !== 'Unknown') {
                        resultText += `   👨‍💻 *Developer:* ${app.developer}\n`;
                    }
                    resultText += `   ⭐ *Rating:* ${rating.toFixed(1)}/10 ${ratingStars}\n`;
                    if (app.version) resultText += `   📌 *Version:* ${app.version}\n`;
                    if (app.size) resultText += `   💾 *Size:* ${app.size}\n`;
                    if (app.requires_android) resultText += `   📱 *Requires:* ${app.requires_android}\n`;
                    if (app.category) resultText += `   🎮 *Category:* ${app.category}\n`;
                    resultText += `   🔗 *Download:* ${app.download_url || app.page_url}\n\n`;
                });
                
                resultText += `> apkpure  ALICIAH | CASPER TECH`;
                
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
                    text: `❌ *No apps found*\n\nNo APK files found for: "${query}"\n\n💡 *Tips:*\n• Try a different app name\n• Check spelling\n• Try: ${prefix}apkpure [app name]\n\n> apkpure  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('APKPure Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching APKPure*\n\n${error.message}\n\nPlease try again later.\n\n> apkpure  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

function getRatingStars(rating) {
    const stars = Math.floor(rating / 2);
    let starString = '';
    for (let i = 0; i < stars; i++) starString += '⭐';
    for (let i = stars; i < 5; i++) starString += '☆';
    return starString;
}

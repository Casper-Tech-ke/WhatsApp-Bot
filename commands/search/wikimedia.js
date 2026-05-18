// commands/search/wikimedia.js
// ALICIAH AI - Wikimedia/Wikipedia Search
// Search and get article summaries - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'wikimedia',
    alias: ['wiki', 'wikipedia', 'encyclopedia'],
    description: 'Search Wikipedia and get article summaries',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📚 *WIKIPEDIA SEARCH*\n\n📝 *Usage:* ${prefix}wikimedia [search term]\n💬 *Examples:*\n   • ${prefix}wikimedia JavaScript\n   • ${prefix}wiki Albert Einstein\n   • ${prefix}wikipedia Artificial Intelligence\n\n📖 *Returns:* Article summary, thumbnail, and full link\n\n> wikimedia  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📚 *Searching Wikipedia for:* "${query}"\n\nPlease wait...\n\n> wikimedia  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/wikimedia?title=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success) {
                const title = response.data.title || 'Article';
                const extract = response.data.extract || 'No description available';
                const description = response.data.description || '';
                const thumbnail = response.data.thumbnail;
                const url = response.data.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
                
                // Truncate extract if too long
                let extractText = extract;
                let truncated = false;
                if (extractText.length > 800) {
                    extractText = extractText.substring(0, 800) + '...';
                    truncated = true;
                }
                
                let resultText = `📚 *${title}*\n`;
                if (description) {
                    resultText += `🏷️ *${description}*\n`;
                }
                resultText += `\n📖 *Summary:*\n${extractText}\n`;
                if (truncated) {
                    resultText += `\n⚠️ *Summary truncated*\n`;
                }
                resultText += `\n🔗 *Read more:* ${url}\n`;
                resultText += `\n> wikimedia  ALICIAH | CASPER TECH`;
                
                // Send with thumbnail if available
                if (thumbnail) {
                    try {
                        await xcasper.sendMessage(chatId, {
                            image: { url: thumbnail },
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
                    text: `❌ *No article found*\n\nNo Wikipedia article found for: "${query}"\n\n💡 *Tips:*\n• Try a different search term\n• Check spelling\n• Try: ${prefix}wiki [different term]\n\n> wikimedia  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Wikimedia Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching Wikipedia*\n\n${error.message}\n\nPlease try again later.\n\n> wikimedia  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

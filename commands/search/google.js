// commands/search/google.js
// ALICIAH AI - Google Search Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'google',
    alias: ['g', 'search', 'web'],
    description: 'Search Google directly from WhatsApp',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🔍 *GOOGLE SEARCH*\n\n` +
                      `📝 *Usage:* ${prefix}google [search term]\n` +
                      `💬 *Example:* ${prefix}google Casper the friendly ghost\n\n` +
                      `🔗 *Source:* Google Search\n` +
                      `⚡ *Powered by:* CASPER TECH KE\n\n` +
                      `> google  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // Send loading message
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🔍 *Searching Google for:* "${query}"\n\nPlease wait...\n\n> google  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Call the Google Search API
            const response = await axios.get(`https://apis.xcasper.space/api/utilities/google-search?q=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success && response.data.results) {
                const results = response.data.results.slice(0, 7);
                const count = response.data.count;
                
                // Build response message
                let resultText = `🔍 *Google Search:* "${query}"\n`;
                resultText += `📊 *Results:* ${count} found\n`;
                resultText += `┌─────────────────┐\n\n`;
                
                results.forEach((result, index) => {
                    resultText += `${index + 1}. *${result.title}*\n`;
                    resultText += `   📝 ${result.description.substring(0, 100)}${result.description.length > 100 ? '...' : ''}\n`;
                    resultText += `   🔗 ${result.url}\n\n`;
                });
                
                resultText += `└─────────────────┘\n`;
                resultText += `> google  ALICIAH | CASPER TECH`;
                
                // Update loading message with results
                await xcasper.sendMessage(chatId, {
                    text: resultText,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found*\n\nNo results for: "${query}"\n\nPlease try a different search term.\n\n> google  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Google Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching Google*\n\n${error.message}\n\nPlease try again later.\n\n> google  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
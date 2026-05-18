// commands/search/duckduckgo.js
// ALICIAH AI - DuckDuckGo Search Command
// Privacy-focused search engine - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'duckduckgo',
    alias: ['ddg', 'duck'],
    description: 'Search the web using DuckDuckGo (privacy-focused)',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🦆 *DUCKDUCKGO SEARCH*\n\n📝 *Usage:* ${prefix}duckduckgo [search term]\n💬 *Examples:*\n   • ${prefix}duckduckgo hello world\n   • ${prefix}ddg programming tutorials\n   • ${prefix}duck JavaScript tutorial\n\n🔒 *Privacy:* No tracking, no logging\n\n> duckduckgo  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🦆 *Searching DuckDuckGo for:* "${query}"\n\nPlease wait...\n\n> duckduckgo  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/duckduckgo?q=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.results && response.data.results.length > 0) {
                const results = response.data.results.slice(0, 7);
                let resultText = `🦆 *DuckDuckGo Search:* "${query}"\n📊 *Results:* ${response.data.totalResults || results.length} found\n\n`;
                
                results.forEach((result, index) => {
                    resultText += `${index + 1}. *${result.title}*\n`;
                    resultText += `   📝 ${result.description.substring(0, 120)}${result.description.length > 120 ? '...' : ''}\n`;
                    resultText += `   🔗 ${result.url}\n\n`;
                });
                
                resultText += `🔒 *Private search - No tracking*\n`;
                resultText += `> duckduckgo  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No results found*\n\nNo results for: "${query}"\n\nPlease try a different search term.\n\n> duckduckgo  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('DuckDuckGo Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching DuckDuckGo*\n\n${error.message}\n\nPlease try again later.\n\n> duckduckgo  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

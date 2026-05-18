// commands/ai/cohere.js
// ALICIAH AI - Cohere AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'cohere',
    alias: ['coh', 'cai', 'ai'],
    description: 'Chat with Cohere AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *COHERE AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}cohere [your message]\n` +
                      `💬 *Example:* ${prefix}cohere Hello\n` +
                      `⚡ *AI Engine:* Cohere by CASPER TECH KE\n\n` +
                      `> cohere  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Cohere API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/cohere?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> cohere  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from Cohere AI\n\n> cohere  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Cohere API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> cohere  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
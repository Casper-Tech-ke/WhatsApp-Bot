// commands/ai/openrouter.js
// ALICIAH AI - OpenRouter AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'openrouter',
    alias: ['or', 'router', 'llama', 'ai'],
    description: 'Chat with OpenRouter AI (Llama 3.1 405B) - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *OPENROUTER AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}openrouter [your message]\n` +
                      `💬 *Example:* ${prefix}openrouter Hello\n` +
                      `🧠 *Model:* Llama 3.1 405B\n` +
                      `⚡ *Provider:* CASPER TECH KE\n\n` +
                      `> openrouter  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the OpenRouter API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/openrouter?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                const model = response.data.model || 'Llama 3.1 405B';
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> openrouter  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from OpenRouter AI\n\n> openrouter  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('OpenRouter API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> openrouter  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
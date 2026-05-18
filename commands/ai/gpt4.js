// commands/ai/chatgpt4o.js
// ALICIAH AI - ChatGPT-4o AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'chatgpt4o',
    alias: ['gpt4', 'gpt4o', 'chatgpt', 'openai', 'ai'],
    description: 'Chat with ChatGPT-4o - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *CHATGPT-4O AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}chatgpt4o [your message]\n` +
                      `💬 *Example:* ${prefix}chatgpt4o Hello\n` +
                      `🧠 *Model:* GPT-4o Mini\n` +
                      `⚡ *Provider:* OpenAI via CASPER TECH KE\n\n` +
                      `> chatgpt4o  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the ChatGPT-4o API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/chatgpt4o?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                const model = response.data.model || 'GPT-4o Mini';
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> chatgpt4o  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from ChatGPT-4o\n\n> chatgpt4o  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('ChatGPT-4o API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> chatgpt4o  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
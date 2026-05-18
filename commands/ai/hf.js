// commands/ai/huggingface.js
// ALICIAH AI - HuggingFace AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'huggingface',
    alias: ['hf', 'hug', 'face', 'ai'],
    description: 'Chat with HuggingFace AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *HUGGINGFACE AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}huggingface [your message]\n` +
                      `💬 *Example:* ${prefix}huggingface Hello\n` +
                      `⚡ *AI Engine:* HuggingFace by CASPER TECH KE\n` +
                      `🤗 *Models:* Multiple Open-Source Models\n\n` +
                      `> huggingface  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the HuggingFace API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/huggingface?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> huggingface  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from HuggingFace AI\n\n> huggingface  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('HuggingFace API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> huggingface  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
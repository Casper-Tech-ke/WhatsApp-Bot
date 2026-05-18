// commands/ai/mistral.js
// ALICIAH AI - Mistral AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'mistral',
    alias: ['m', 'ask', 'chat'],
    description: 'Chat with Mistral AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *MISTRAL AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}mistral [your message]\n` +
                      `💬 *Example:* ${prefix}mistral Hello\n` +
                      `⚡ *AI Engine:* Mistral AI by CASPER TECH KE\n\n` +
                      `> mistral  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Mistral API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/mistral?message=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> mistral  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from Mistral AI\n\n> mistral  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Mistral API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> mistral  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
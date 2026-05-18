// commands/ai/cerebras.js
// ALICIAH AI - Cerebras AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'cerebras',
    alias: ['cere', 'crb', 'ai'],
    description: 'Chat with Cerebras AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *CEREBRAS AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}cerebras [your message]\n` +
                      `💬 *Example:* ${prefix}cerebras Hello\n` +
                      `⚡ *AI Engine:* Cerebras by CASPER TECH KE\n` +
                      `🌍 *Specialty:* Multilingual Support\n\n` +
                      `> cerebras  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Cerebras API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/cerebras?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> cerebras  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from Cerebras AI\n\n> cerebras  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Cerebras API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> cerebras  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
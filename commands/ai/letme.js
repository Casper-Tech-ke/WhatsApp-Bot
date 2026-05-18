// commands/ai/letmegpt.js
// ALICIAH AI - LetMeGPT AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'letmegpt',
    alias: ['letme', 'lmg', 'gpt', 'ai'],
    description: 'Chat with LetMeGPT - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *LETMEGPT AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}letmegpt [your message]\n` +
                      `💬 *Example:* ${prefix}letmegpt Hello\n` +
                      `⚡ *AI Engine:* LetMeGPT by CASPER TECH KE\n\n` +
                      `> letmegpt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the LetMeGPT API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/letmegpt?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> letmegpt  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from LetMeGPT\n\n> letmegpt  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('LetMeGPT API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> letmegpt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
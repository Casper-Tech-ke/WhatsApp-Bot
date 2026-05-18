// commands/ai/pollinations.js
// ALICIAH AI - Pollinations AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'pollinations',
    alias: ['poll', 'pai', 'ai'],
    description: 'Chat with Pollinations AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *POLLINATIONS AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}pollinations [your message]\n` +
                      `💬 *Example:* ${prefix}pollinations Hello\n` +
                      `⚡ *AI Engine:* Pollinations by CASPER TECH KE\n\n` +
                      `> pollinations  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Pollinations API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/pollinations?prompt=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> pollinations  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from Pollinations AI\n\n> pollinations  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Pollinations API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> pollinations  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
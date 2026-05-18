// commands/ai/grok.js
// ALICIAH AI Command - Powered by CASPER TECH KE
// Simple AI chat using grok API

import axios from 'axios';

export default {
    name: 'grok',
    alias: ['ai', 'ask', 'chat', 'alicia'],
    description: 'Chat with ALICIAH AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, {
        BOT_NAME,
        VERSION,
        rateLimiter
    }) {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *ALICIAH AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}grok [your message]\n` +
                      `💬 *Example:* ${prefix}grok Hello\n\n` +
                      `> grok  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Grok API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/grok?query=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> grok  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from AI\n\n> grok  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('AI API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}\n\n> grok  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
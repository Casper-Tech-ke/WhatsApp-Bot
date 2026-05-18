// commands/ai/grok.js
// Grok AI Command - Powered by CASPER TECH API
// Simple AI chat using grok API

import axios from 'axios';

export default {
    name: 'grok',
    alias: ['ai', 'ask', 'chat'],
    description: 'Chat with Grok AI',
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
                text: `🤖 *Grok AI*\n\nUsage: ${prefix}grok [your message]\n\nExample: ${prefix}grok Hello` 
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
                    text: `🤖 *Grok:* ${reply}` 
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ Error: Could not get response from AI` 
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Grok API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}` 
            }, { quoted: msg });
        }
    }
};
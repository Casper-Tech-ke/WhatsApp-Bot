// commands/religious/quranai.js
// ALICIAH AI - Quran AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'quranai',
    alias: ['quran', 'islam', 'allah'],
    description: 'Ask questions about Islam and get Quran-based answers',
    category: 'religious',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🕊️ *QURAN AI - Q&A*\n\n` +
                      `📝 *Usage:* ${prefix}quranai [your question]\n` +
                      `💬 *Example:* ${prefix}quranai What is peace\n` +
                      `📚 *More examples:*\n` +
                      `   • ${prefix}quranai Who is Allah\n` +
                      `   • ${prefix}quranai What is prayer\n` +
                      `   • ${prefix}quranai Explain mercy\n\n` +
                      `> quranai  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const question = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Quran AI API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/quran-ai?question=${encodeURIComponent(question)}`);
            
            if (response.data && response.data.success && response.data.reply && response.data.reply.trim() !== '') {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> quranai  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                // Handle empty response gracefully
                await xcasper.sendMessage(chatId, { 
                    text: `🕊️ *QURAN AI*\n\nI'm still learning about: *${question}*\n\n📖 *Suggestion:* Try asking a different question or rephrase.\n\n🔗 *Recommended:* Visit https://quran.com for more information.\n\n> quranai  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Quran AI API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* Could not connect to Quran AI service.\n\nPlease try again later.\n\n> quranai  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
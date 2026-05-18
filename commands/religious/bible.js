// commands/religious/bibleai.js
// ALICIAH AI - Bible AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'bibleai',
    alias: ['bible', 'scripture', 'god', 'jesus', 'faith'],
    description: 'Ask biblical questions and get scripture-based answers',
    category: 'religious',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📖 *BIBLE AI - Q&A*\n\n` +
                      `📝 *Usage:* ${prefix}bibleai [your question]\n` +
                      `💬 *Example:* ${prefix}bibleai What is love\n` +
                      `📚 *More examples:*\n` +
                      `   • ${prefix}bibleai Who is God\n` +
                      `   • ${prefix}bibleai What is faith\n` +
                      `   • ${prefix}bibleai Explain forgiveness\n\n` +
                      `> bibleai  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const question = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Call the Bible AI API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/bible-ai?question=${encodeURIComponent(question)}`);
            
            if (response.data && response.data.success) {
                const reply = response.data.reply;
                
                await xcasper.sendMessage(chatId, { 
                    text: `${reply}\n\n> bibleai  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Error:* Could not get response from Bible AI\n\nPlease try again.\n\n> bibleai  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Bible AI API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\nPlease try again later.\n\n> bibleai  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
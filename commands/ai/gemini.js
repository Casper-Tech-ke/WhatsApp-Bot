// commands/ai/gemini.js
// ALICIAH AI - Gemini AI Command
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'gemini',
    alias: ['gem', 'ai', 'ask'],
    description: 'Chat with Gemini AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a question
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🤖 *GEMINI AI - Chat System*\n\n` +
                      `📝 *Usage:* ${prefix}gemini [your message]\n` +
                      `💬 *Example:* ${prefix}gemini Hello\n` +
                      `⚡ *AI Engine:* Gemini by CASPER TECH KE\n\n` +
                      `> gemini  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            const response = await axios.get('https://apiz.xcasper.space/api/ai/gemini', {
                params: { query },
                timeout: 90000
            });

            if (response.data && response.data.success === false) {
                throw new Error(response.data.error || 'Could not get response from Gemini AI');
            }

            const reply = response.data?.data?.reply || response.data?.reply || response.data?.response || response.data?.message || response.data?.result || "I'm not sure how to respond to that.";

            await xcasper.sendMessage(chatId, {
                text: `${reply}\n\n> gemini  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        } catch (error) {
            console.error('Gemini API Error:', error.message);
            const errorMsg = error.response?.data?.error || error.message;

            await xcasper.sendMessage(chatId, {
                text: `❌ Error: ${errorMsg}\n\n> gemini  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
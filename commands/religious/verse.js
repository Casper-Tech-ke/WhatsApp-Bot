// commands/religious/verse.js
// ALICIAH AI - Bible Verse Lookup
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'verse',
    alias: ['bibleverse', 'scripture', 'v'],
    description: 'Lookup any Bible verse by reference - Powered by CASPER TECH KE',
    category: 'religious',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a reference
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📖 *BIBLE VERSE LOOKUP*\n\n` +
                      `📝 *Usage:* ${prefix}verse [book chapter:verse]\n` +
                      `💬 *Examples:*\n` +
                      `   • ${prefix}verse John 3:16\n` +
                      `   • ${prefix}verse Genesis 1:1\n` +
                      `   • ${prefix}verse Psalms 23:1\n` +
                      `   • ${prefix}verse Romans 8:28\n\n` +
                      `🌐 *Translation:* World English Bible (WEB)\n\n` +
                      `> verse  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const reference = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        try {
            // Format reference for URL (replace spaces with +)
            const formattedRef = reference.replace(/ /g, '+');
            
            // Call the Bible API
            const response = await axios.get(`https://apis.xcasper.space/api/scriptures/bible?reference=${encodeURIComponent(formattedRef)}`);
            
            if (response.data && response.data.success) {
                const verseText = response.data.text.trim();
                const referenceFormatted = response.data.reference;
                const translation = response.data.translation;
                
                await xcasper.sendMessage(chatId, { 
                    text: `📖 *${referenceFormatted}* (${translation})\n\n${verseText}\n\n> verse  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Verse not found*\n\nCould not find: "${reference}"\n\n📝 *Format:* Book Chapter:Verse\n💬 *Example:* John 3:16\n\n> verse  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Bible Verse API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* Could not fetch verse.\n\nPlease check the format and try again.\n📝 *Example:* ${prefix}verse John 3:16\n\n> verse  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
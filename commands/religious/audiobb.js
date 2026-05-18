// commands/religious/bibleaudio.js
// ALICIAH AI - Bible Audio Command
// Listen to Bible chapters - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'bibleaudio',
    alias: ['bibleplay', 'biblelisten', 'scriptureaudio'],
    description: 'Listen to audio and read any Bible chapter - Powered by CASPER TECH KE',
    category: 'religious',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided book and chapter
        if (args.length < 2) {
            await xcasper.sendMessage(chatId, { 
                text: `🎧 *BIBLE AUDIO - Listen to Scripture*\n\n` +
                      `📝 *Usage:* ${prefix}bibleaudio [book] [chapter]\n` +
                      `💬 *Examples:*\n` +
                      `   • ${prefix}bibleaudio John 3\n` +
                      `   • ${prefix}bibleaudio Psalms 23\n` +
                      `   • ${prefix}bibleaudio Genesis 1\n` +
                      `   • ${prefix}bibleaudio Romans 8\n\n` +
                      `📖 *Books:* Genesis, Exodus, Psalms, John, Romans, etc.\n\n` +
                      `> bibleaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const book = args[0];
        const chapter = args[1];
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // Send loading message
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎧 *Loading ${book} ${chapter}...*\n\nPlease wait...\n\n> bibleaudio  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Call the Bible Audio API
            const response = await axios.get(`https://apis.xcasper.space/api/scriptures/bible-audio?book=${encodeURIComponent(book)}&chapter=${chapter}`);
            
            if (response.data && response.data.success) {
                const audioUrl = response.data.audioUrl || response.data.directUrl;
                const verseText = response.data.text || '';
                const translation = response.data.translation === 'kj' ? 'King James Version' : 'World English Bible';
                
                // Clean up the text (remove extra newlines)
                const cleanText = verseText.replace(/\n\s*\n/g, '\n').trim();
                
                // Send the Bible text as a separate message first
                await xcasper.sendMessage(chatId, { 
                    text: `📖 *${book} ${chapter}* (${translation})\n\n${cleanText}\n\n> bibleaudio  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                // Then send the audio
                await xcasper.sendMessage(chatId, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    caption: `🎧 *Audio: ${book} ${chapter}*\n\n> bibleaudio  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                // Update loading message to show completion
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Done!* Audio and text for ${book} ${chapter} sent successfully.\n\n> bibleaudio  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Chapter not found*\n\nCould not find audio for: *${book} ${chapter}*\n\n📝 *Please check:*\n• Book name spelling\n• Chapter exists\n• Example: ${prefix}bibleaudio John 3\n\n> bibleaudio  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Bible Audio API Error:', error.message);
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error fetching audio*\n\nCould not retrieve audio for *${book} ${chapter}*\n\n💡 *Try:* ${prefix}bibleaudio John 3\n\n> bibleaudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
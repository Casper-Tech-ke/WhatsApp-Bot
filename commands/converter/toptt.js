// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note (Simple Test)
// Powered by CASPER TECH KE

export default {
    name: 'toptt',
    alias: ['testvoice'],
    description: 'Convert audio to voice note',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        console.log('=== TOPTT COMMAND TRIGGERED ===');
        
        // Send a simple response to confirm command works
        await xcasper.sendMessage(chatId, { 
            text: `✅ *toptt command is working!*\n\nNow testing with actual audio conversion...\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        // Check if replying to an audio
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedAudio = quoted?.audioMessage;
        
        if (!quotedAudio) {
            await xcasper.sendMessage(chatId, { 
                text: `⚠️ *No audio found*\n\nPlease reply to an audio message.\n\n> toptt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Found audio!*\n\nNow converting to voice note...\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
    }
};

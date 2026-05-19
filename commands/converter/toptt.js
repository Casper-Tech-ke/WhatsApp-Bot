// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note (Debug)
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import { downloadAndSaveMediaMessage, toPtt } from '../../utils/gift-utils.js';

export default {
    name: 'toptt',
    alias: ['tovoice', 'tovn', 'tovoicenote'],
    description: 'Convert audio to WhatsApp voice note',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        console.log('=== TOPTT DEBUG ===');
        console.log('1. Command started');
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedAudio = quoted?.audioMessage;
        
        console.log('2. Quoted audio:', quotedAudio ? 'Yes' : 'No');
        
        if (!quotedAudio) {
            await xcasper.sendMessage(chatId, { 
                text: `🎙️ *AUDIO TO VOICE NOTE*\n\n📝 *Usage:* Reply to an audio with: ${prefix}toptt\n\n> toptt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Converting to voice note...*\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempFilePath = null;
        
        try {
            console.log('3. Downloading media...');
            tempFilePath = await downloadAndSaveMediaMessage(quotedAudio);
            console.log('4. Downloaded to:', tempFilePath);
            
            console.log('5. Reading file...');
            const buffer = await fs.readFile(tempFilePath);
            console.log('6. Buffer size:', buffer.length);
            
            console.log('7. Converting to PTT...');
            const convertedBuffer = await toPtt(buffer);
            console.log('8. Converted size:', convertedBuffer.length);
            
            console.log('9. Sending voice note...');
            await xcasper.sendMessage(chatId, {
                audio: convertedBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            console.log('10. Sent successfully!');
            
            await fs.unlink(tempFilePath).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Voice note created!*\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('=== TOPTT ERROR ===');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\nCheck console for details.\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

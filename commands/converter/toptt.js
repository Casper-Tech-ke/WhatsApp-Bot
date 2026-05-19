// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note
// Convert audio to WhatsApp voice note (PTT)
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
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedAudio = quoted?.audioMessage;
        
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
            tempFilePath = await downloadAndSaveMediaMessage(quotedAudio);
            const buffer = await fs.readFile(tempFilePath);
            const convertedBuffer = await toPtt(buffer);
            
            await xcasper.sendMessage(chatId, {
                audio: convertedBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            
            await fs.unlink(tempFilePath).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Voice note created!*\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

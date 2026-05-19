// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note
// Convert audio to WhatsApp voice note (PTT)
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import { downloadAndSaveMedia, audioToPTT, cleanup } from '../../utils/alicia-utils.js';

export default {
    name: 'toptt',
    alias: ['tovoice', 'tovn', 'tovoicenote'],
    description: 'Convert audio to WhatsApp voice note',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Get quoted message
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedAudio = quoted?.audioMessage;
        
        if (!quotedAudio) {
            await xcasper.sendMessage(chatId, { 
                text: `🎙️ *AUDIO TO VOICE NOTE*\n\n📝 *Usage:* Reply to an audio message with:\n   • ${prefix}toptt\n   • ${prefix}tovoice\n   • ${prefix}tovn\n\n> toptt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Converting to voice note...*\n\nPlease wait...\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempFile = null;
        
        try {
            // Download the audio
            tempFile = await downloadAndSaveMedia(quotedAudio);
            const audioBuffer = await fs.readFile(tempFile);
            
            // Convert to voice note
            const pttBuffer = await audioToPTT(audioBuffer);
            
            // Send as voice note
            await xcasper.sendMessage(chatId, {
                audio: pttBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            
            // Cleanup
            await cleanup([tempFile]);
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Voice note ready!*\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Toptt error:', error);
            if (tempFile) await cleanup([tempFile]);
            
            let errorMsg = "❌ *Conversion failed*\n\n";
            if (error.message.includes('ffmpeg')) {
                errorMsg += "FFmpeg is not installed. Please install it first.";
            } else {
                errorMsg += error.message;
            }
            errorMsg += `\n\n> toptt  ALICIAH | CASPER TECH`;
            
            await xcasper.sendMessage(chatId, { text: errorMsg, edit: loadingMsg.key });
        }
    }
};

// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note
// Convert audio to WhatsApp voice note (PTT)
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const randomName = (ext) => randomBytes(8).toString('hex') + ext;

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
        
        // Send acknowledgment
        await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Converting to voice note...*\n\nPlease wait...\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempFilePath = null;
        let outputFile = null;
        
        try {
            // Download audio
            const response = await fetch(quotedAudio.url);
            const audioBuffer = Buffer.from(await response.arrayBuffer());
            
            // Save temp file
            tempFilePath = randomName('.mp3');
            await fs.writeFile(tempFilePath, audioBuffer);
            
            outputFile = randomName('.opus');
            
            // Convert to opus for voice note
            // FFmpeg command: convert to opus, 16kbps, 16kHz, mono
            await execPromise(`ffmpeg -i "${tempFilePath}" -c:a libopus -b:a 16k -ar 16000 -ac 1 "${outputFile}" -y`);
            
            // Read converted file
            const pttBuffer = await fs.readFile(outputFile);
            
            // Send as voice note
            await xcasper.sendMessage(chatId, {
                audio: pttBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            
            // Cleanup
            await fs.unlink(tempFilePath).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
        } catch (error) {
            console.error('Toptt error:', error);
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\nMake sure ffmpeg is installed.\n\n> toptt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};

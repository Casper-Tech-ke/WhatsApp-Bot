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
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedAudio = quoted?.audioMessage;
        
        if (!quotedAudio) {
            await xcasper.sendMessage(chatId, { 
                text: `🎙️ *AUDIO TO VOICE NOTE*\n\n📝 *Usage:* Reply to an audio message with: ${prefix}toptt\n\n> toptt  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Converting to voice note...*\n\nPlease wait...\n\n> toptt  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        let tempFilePath = null;
        let outputFile = null;
        let wavFile = null;
        
        try {
            // Download audio
            const response = await fetch(quotedAudio.url);
            const audioBuffer = Buffer.from(await response.arrayBuffer());
            
            tempFilePath = randomName('.mp3');
            await fs.writeFile(tempFilePath, audioBuffer);
            
            wavFile = randomName('.wav');
            outputFile = randomName('.opus');
            
            // First convert to WAV to fix header issues, then to opus
            await execPromise(`ffmpeg -i "${tempFilePath}" -acodec pcm_s16le -ar 16000 -ac 1 "${wavFile}" -y`);
            
            // Then convert WAV to opus for voice note
            await execPromise(`ffmpeg -i "${wavFile}" -c:a libopus -b:a 16k -ar 16000 -ac 1 "${outputFile}" -y`);
            
            const pttBuffer = await fs.readFile(outputFile);
            
            await xcasper.sendMessage(chatId, {
                audio: pttBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            
            // Cleanup
            await fs.unlink(tempFilePath).catch(() => {});
            await fs.unlink(wavFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
        } catch (error) {
            console.error('Toptt error:', error);
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
            if (wavFile) await fs.unlink(wavFile).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            let errorMsg = "❌ *Failed to convert to voice note*\n\n";
            if (error.message.includes('Header missing')) {
                errorMsg += "The audio format is not supported. Try a different audio file.";
            } else {
                errorMsg += error.message;
            }
            errorMsg += `\n\n> toptt  ALICIAH | CASPER TECH`;
            
            await xcasper.sendMessage(chatId, { text: errorMsg }, { quoted: msg });
        }
    }
};

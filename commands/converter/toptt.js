// commands/converter/toptt.js
// ALICIAH AI - Audio to Voice Note
// Convert audio to WhatsApp voice note (PTT)
// Powered by CASPER TECH KE

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const randomName = (ext) => {
    const tempDir = path.join(process.cwd(), 'temp');
    return path.join(tempDir, `${Date.now()}_${randomBytes(4).toString('hex')}${ext}`);
};

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
        
        let tempDir = path.join(process.cwd(), 'temp');
        let inputFile = null;
        let outputFile = null;
        
        try {
            // Create temp directory
            await fs.mkdir(tempDir, { recursive: true });
            
            // Download audio
            const response = await fetch(quotedAudio.url);
            const audioBuffer = Buffer.from(await response.arrayBuffer());
            
            inputFile = randomName('.mp3');
            outputFile = randomName('.opus');
            
            await fs.writeFile(inputFile, audioBuffer);
            
            // Convert with ignore errors and force re-encode
            await execPromise(`ffmpeg -err_detect ignore_err -i "${inputFile}" -c:a libopus -b:a 16k -ar 16000 -ac 1 "${outputFile}" -y`);
            
            const pttBuffer = await fs.readFile(outputFile);
            
            await xcasper.sendMessage(chatId, {
                audio: pttBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: msg });
            
            // Cleanup
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Voice note ready!*\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Toptt error:', error);
            if (inputFile) await fs.unlink(inputFile).catch(() => {});
            if (outputFile) await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\nThe audio format may not be supported.\n\n> toptt  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

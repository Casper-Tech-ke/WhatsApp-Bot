// commands/tools/tts.js
// ALICIAH AI - Text to Speech Tool
// Convert text to speech with multiple voice options
// Powered by CASPER TECH KE

import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const randomName = () => randomBytes(8).toString('hex');

export default {
    name: 'tts',
    alias: ['speak', 'say', 'voice', 'texttospeech'],
    description: 'Convert text to speech audio with voice selection',
    category: 'tools',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user wants to see available voices
        if (args.length && args[0].toLowerCase() === 'voices') {
            try {
                const response = await axios.get('https://apis.xcasper.space/api/tools/tts?text=test');
                const voices = response.data?.availableVoices;
                
                if (voices) {
                    let voicesText = `🎙️ *AVAILABLE VOICES*\n\n`;
                    voices.forEach(voice => {
                        const genderEmoji = voice.gender === 'male' ? '♂️' : voice.gender === 'female' ? '♀️' : '⚧️';
                        voicesText += `*${voice.id}* - ${voice.label} ${genderEmoji}\n`;
                        voicesText += `  📝 ${voice.style}\n\n`;
                    });
                    voicesText += `💡 *Usage:* ${prefix}tts [voice] [text]\n`;
                    voicesText += `💬 *Example:* ${prefix}tts nova Hello\n\n`;
                    voicesText += `> tts  ALICIAH | CASPER TECH`;
                    
                    await xcasper.sendMessage(chatId, { text: voicesText }, { quoted: msg });
                }
            } catch (error) {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Failed to fetch voices*\n\n> tts  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            return;
        }
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎙️ *TEXT TO SPEECH*\n\n📝 *Usage:* ${prefix}tts [voice] [text]\n💬 *Example:* ${prefix}tts nova Hello world\n\n💡 *Voice is optional*\n\n📋 *Type* ${prefix}tts voices *to see all voices*\n\n> tts  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const availableVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash', 'coral', 'sage'];
        
        let voice = '';
        let text = '';
        
        if (availableVoices.includes(args[0].toLowerCase())) {
            voice = args[0].toLowerCase();
            text = args.slice(1).join(' ');
        } else {
            voice = '';
            text = args.join(' ');
        }
        
        if (!text.trim()) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *No text provided*\n\n> tts  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('recording', chatId);
        
        const displayVoice = voice || 'default';
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎙️ *Converting to speech...*\n\n📝 "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"\n🎤 ${displayVoice}\n\n> tts  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        const tempDir = path.join(process.cwd(), 'tmp');
        const inputFile = path.join(tempDir, `${randomName()}.mp3`);
        const outputFile = path.join(tempDir, `${randomName()}.ogg`);
        
        try {
            let apiUrl = `https://apis.xcasper.space/api/tools/tts?text=${encodeURIComponent(text)}`;
            if (voice) apiUrl += `&voice=${voice}`;
            
            const response = await axios.get(apiUrl);
            
            if (response.data?.success && response.data?.audioUrl) {
                const data = response.data;
                
                // Download audio as arraybuffer
                const audioResponse = await axios.get(data.audioUrl, { 
                    responseType: 'arraybuffer'
                });
                
                const audioBuffer = Buffer.from(audioResponse.data);
                
                // Save to temp file
                await fs.mkdir(tempDir, { recursive: true });
                await fs.writeFile(inputFile, audioBuffer);
                
                // Convert MP3 to OGG/Opus for WhatsApp voice note compatibility
                try {
                    execSync(`ffmpeg -i "${inputFile}" -c:a libopus -b:a 16k -ac 1 -ar 16000 "${outputFile}" -y`, { stdio: 'pipe' });
                    const oggBuffer = await fs.readFile(outputFile);
                    
                    // Send as voice note
                    await xcasper.sendMessage(chatId, {
                        audio: oggBuffer,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true
                    }, { quoted: msg });
                    
                    await fs.unlink(outputFile).catch(() => {});
                } catch (ffmpegError) {
                    console.log('FFmpeg not available, trying direct MP3...');
                    // Fallback: try sending MP3 directly as voice note
                    await xcasper.sendMessage(chatId, {
                        audio: audioBuffer,
                        mimetype: 'audio/mp4',
                        ptt: true
                    }, { quoted: msg });
                }
                
                // Cleanup input file
                await fs.unlink(inputFile).catch(() => {});
                
                // Edit loading message
                let resultText = `🎙️ *TEXT TO SPEECH*\n\n`;
                resultText += `📝 "${data.text.substring(0, 60)}${data.text.length > 60 ? '...' : ''}"\n`;
                resultText += `🎤 ${data.voiceInfo.label} (${data.voiceInfo.gender})\n`;
                resultText += `⏱️ ${data.ttsProcessingTime}\n\n`;
                resultText += `> tts  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, {
                    text: resultText,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *TTS failed*\n\nTry again.\n\n> tts  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('TTS error:', error.message);
            
            // Cleanup
            await fs.unlink(inputFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\n> tts  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

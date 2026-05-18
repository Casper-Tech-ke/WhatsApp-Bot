// commands/ai/magicstudio.js
// ALICIAH AI - MagicStudio Image Generator
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'magicstudio',
    alias: ['magic', 'img', 'generate', 'draw', 'create'],
    description: 'Generate images using MagicStudio AI - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a prompt
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *MAGICSTUDIO - Image Generator*\n\n` +
                      `📝 *Usage:* ${prefix}magicstudio [image description]\n` +
                      `💬 *Example:* ${prefix}magicstudio a beautiful sunset over mountains\n` +
                      `⚡ *AI Engine:* MagicStudio by CASPER TECH KE\n\n` +
                      `> magicstudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const prompt = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // Send initial message
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Generating image...*\n\n📝 *Prompt:* ${prompt}\n⏳ Please wait...\n\n> magicstudio  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Call the MagicStudio API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/magicstudio?prompt=${encodeURIComponent(prompt)}`);
            
            if (response.data && response.data.success && response.data.image_url) {
                const imageUrl = response.data.image_url;
                
                // Send the generated image
                await xcasper.sendMessage(chatId, {
                    image: { url: imageUrl },
                    caption: `🎨 *Generated Image*\n\n📝 *Prompt:* ${prompt}\n🎯 *Source:* MagicStudio AI\n\n> magicstudio  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                // Delete loading message
                await xcasper.sendMessage(chatId, { delete: loadingMsg.key });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Generation Failed*\n\nCould not generate image for: "${prompt}"\nPlease try a different description.\n\n> magicstudio  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('MagicStudio API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\nPlease try again later.\n\n> magicstudio  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
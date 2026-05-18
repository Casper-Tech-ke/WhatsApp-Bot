// commands/ai/pollinations-image.js
// ALICIAH AI - Pollinations Image Generator
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'pollinations-image',
    alias: ['pimg', 'pollen', 'paiimg', 'imagine'],
    description: 'Generate images using Pollinations AI with Flux model - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a prompt
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *POLLINATIONS IMAGE - AI Generator*\n\n` +
                      `📝 *Usage:* ${prefix}pollinations-image [image description]\n` +
                      `💬 *Example:* ${prefix}pollinations-image a golden lion\n` +
                      `⚡ *Model:* Flux (Default)\n` +
                      `🎯 *Provider:* Pollinations AI via CASPER TECH KE\n\n` +
                      `> pollinations-image  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const prompt = args.join(' ');
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // Send initial loading message
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Generating image with Pollinations AI...*\n\n📝 *Prompt:* ${prompt}\n🎨 *Model:* Flux\n⏳ Please wait...\n\n> pollinations-image  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Call the Pollinations Image API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/pollinations-image?prompt=${encodeURIComponent(prompt)}&model=flux`);
            
            if (response.data && response.data.success && response.data.image_url) {
                const imageUrl = response.data.image_url;
                
                // Send the generated image
                await xcasper.sendMessage(chatId, {
                    image: { url: imageUrl },
                    caption: `🎨 *Generated Image*\n\n📝 *Prompt:* ${prompt}\n🎨 *Model:* Flux\n🎯 *Source:* Pollinations AI\n\n> pollinations-image  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                // Delete the loading message
                await xcasper.sendMessage(chatId, { delete: loadingMsg.key });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Generation Failed*\n\nCould not generate image for: "${prompt}"\nPlease try a different description.\n\n> pollinations-image  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Pollinations Image API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\nPlease try again later.\n\n> pollinations-image  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
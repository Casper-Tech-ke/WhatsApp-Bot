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
            const response = await axios.get('https://apiz.xcasper.space/api/ai/pollinations-image', {
                params: { prompt, model: 'flux' },
                timeout: 90000
            });

            const imageUrl = response.data?.data?.image_url || response.data?.image_url;

            if (response.data && response.data.success === false) {
                throw new Error(response.data.error || 'Could not generate image');
            }

            if (!imageUrl) {
                throw new Error('The image service returned no image URL.');
            }

            await xcasper.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: `🎨 *Generated Image*\n\n📝 *Prompt:* ${prompt}\n🎨 *Model:* Flux\n🎯 *Source:* Pollinations AI\n\n> pollinations-image  ALICIAH | CASPER TECH`
            }, { quoted: msg });

            await xcasper.sendMessage(chatId, { delete: loadingMsg.key });
        } catch (error) {
            console.error('Pollinations Image API Error:', error.message);
            const errorMsg = error.response?.data?.error || error.message;
            await xcasper.sendMessage(chatId, {
                text: `❌ *Error:* ${errorMsg}\n\nPlease try again later.\n\n> pollinations-image  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
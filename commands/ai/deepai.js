// commands/ai/deepai.js
// ALICIAH AI - DeepAI Image Generator
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'deepai',
    alias: ['deep', 'aiimg', 'art', 'generate'],
    description: 'Generate images using DeepAI with different styles - Powered by CASPER TECH KE',
    category: 'ai',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        // Check if user provided a prompt
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🎨 *DEEPAI - Image Generator*\n\n` +
                      `📝 *Usage:* ${prefix}deepai [prompt] | [style]\n` +
                      `💬 *Examples:*\n` +
                      `   • ${prefix}deepai a cat\n` +
                      `   • ${prefix}deepai a cat | anime-portrait-generator\n` +
                      `   • ${prefix}deepai a cat | fantasy-art-generator\n\n` +
                      `🎨 *Available Styles:*\n` +
                      `   • anime-portrait-generator\n` +
                      `   • fantasy-art-generator\n` +
                      `   • retro-arcade-generator\n` +
                      `   • steampunk-generator\n` +
                      `   • vaporwave-generator\n` +
                      `   • sketch-generator\n` +
                      `   • painting-generator\n\n` +
                      `💡 *Tip:* Use | to separate prompt from style\n\n` +
                      `> deepai  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        // Parse prompt and style
        let prompt = args.join(' ');
        let style = 'anime-portrait-generator'; // Default style
        
        if (prompt.includes('|')) {
            const parts = prompt.split('|');
            prompt = parts[0].trim();
            style = parts[1].trim();
        }
        
        // Send typing indicator
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        // Send initial message
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🎨 *Generating image...*\n\n📝 *Prompt:* ${prompt}\n🎨 *Style:* ${style}\n⏳ Please wait...\n\n> deepai  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // Call the DeepAI API
            const response = await axios.get(`https://apis.xcasper.space/api/ai/deepai?text=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}`);
            
            if (response.data && response.data.success && response.data.image_url) {
                const imageUrl = response.data.image_url;
                
                // Send the generated image
                await xcasper.sendMessage(chatId, {
                    image: { url: imageUrl },
                    caption: `🎨 *Generated Image*\n\n📝 *Prompt:* ${prompt}\n🎨 *Style:* ${style}\n🎯 *Source:* DeepAI\n\n> deepai  ALICIAH | CASPER TECH`
                }, { quoted: msg });
                
                // Delete loading message
                await xcasper.sendMessage(chatId, { delete: loadingMsg.key });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Generation Failed*\n\nCould not generate image for: "${prompt}"\nPlease try a different description or style.\n\n> deepai  ALICIAH | CASPER TECH`
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('DeepAI API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${error.message}\n\nPlease try again later.\n\n> deepai  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
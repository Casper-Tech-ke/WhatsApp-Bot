// commands/search/pinterest.js
// ALICIAH AI - Pinterest Image Search
// Find and share beautiful images - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'pinterest',
    alias: ['pin', 'pint', 'image'],
    description: 'Search for images on Pinterest',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📌 *PINTEREST IMAGE SEARCH*\n\n📝 *Usage:* ${prefix}pinterest [search term]\n💬 *Examples:*\n   • ${prefix}pinterest sunset\n   • ${prefix}pin beautiful landscape\n   • ${prefix}pint cute cats\n\n🖼️ *Returns:* Top 5 matching images\n\n> pinterest  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const query = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📌 *Searching Pinterest for:* "${query}"\n\nPlease wait...\n\n> pinterest  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/pinterest?q=${encodeURIComponent(query)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success && response.data.images && response.data.images.length > 0) {
                const images = response.data.images.slice(0, 5);
                const totalFound = response.data.totalPinsFound || images.length;
                
                // Send first image with caption
                const firstImage = images[0];
                let caption = `📌 *Pinterest Search:* "${query}"\n`;
                caption += `📊 *Found:* ${totalFound} images\n`;
                caption += `🖼️ *Showing:* ${images.length} images\n\n`;
                if (firstImage.name && firstImage.name !== 'Untitled') {
                    caption += `📝 *${firstImage.name}*\n`;
                }
                if (firstImage.source && firstImage.source !== 'Uploaded by user') {
                    caption += `📡 *Source:* ${firstImage.source}\n`;
                }
                caption += `📅 *Uploaded:* ${firstImage.uploadedDate || 'Unknown'}\n\n`;
                caption += `> pinterest  ALICIAH | CASPER TECH`;
                
                // Send first image
                await xcasper.sendMessage(chatId, {
                    image: { url: firstImage.imageUrl },
                    caption: caption
                }, { quoted: msg });
                
                // Send remaining images as separate messages
                for (let i = 1; i < images.length; i++) {
                    const image = images[i];
                    let imgCaption = `📌 *Image ${i+1}/${images.length}*\n`;
                    if (image.name && image.name !== 'Untitled') {
                        imgCaption += `📝 *${image.name}*\n`;
                    }
                    if (image.source && image.source !== 'Uploaded by user') {
                        imgCaption += `📡 *Source:* ${image.source}\n`;
                    }
                    imgCaption += `\n> pinterest  ALICIAH | CASPER TECH`;
                    
                    await xcasper.sendMessage(chatId, {
                        image: { url: image.imageUrl },
                        caption: imgCaption
                    }, { quoted: msg });
                    
                    // Small delay between images
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                // Update loading message
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Complete!* Found and sent ${images.length} images for "${query}"\n\n> pinterest  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *No images found*\n\nNo images found for: "${query}"\n\nPlease try a different search term.\n\n> pinterest  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Pinterest Search API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error searching Pinterest*\n\n${error.message}\n\nPlease try again later.\n\n> pinterest  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

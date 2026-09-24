import axios from 'axios';

export default {
    name: 'text2img',
    alias: ['aiimage', 'imagine2'],
    description: 'Generate an image from a text prompt.',
    category: 'ai',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        if (!args.length) {
            await xcasper.sendMessage(chatId, {
                text: `🎨 *TEXT TO IMAGE*\n\n📝 *Usage:* ${prefix}text2img [description]\n💬 *Example:* ${prefix}text2img a blue flower\n\n> text2img  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }

        const prompt = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        try {
            const response = await axios.get('https://apiz.xcasper.space/api/ai/text2img', {
                params: { prompt, model: 'flux' },
                timeout: 90000
            });
            const imageUrl = response.data?.data?.image_url || response.data?.image_url;
            if (!imageUrl) throw new Error(response.data?.error || 'The image service returned no image.');
            await xcasper.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: `🎨 *Generated Image*\n\n📝 *Prompt:* ${prompt}\n🎯 *Source:* XCASPER SPACE\n\n> text2img  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        } catch (error) {
            const detail = error.response?.data?.error || error.message;
            console.error('Text2Img API Error:', detail);
            await xcasper.sendMessage(chatId, {
                text: `❌ *Text-to-image failed:* ${detail}\n\n> text2img  ALICIAH | CASPER TECH`
            }, { quoted: msg });
        }
    }
};
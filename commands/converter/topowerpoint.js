// commands/converter/topowerpoint.js
// ALICIAH AI - Text to PowerPoint
// Convert text into .pptx presentation
// Powered by CASPER TECH KE

import pptxgen from 'pptxgenjs';

function parseSlides(text) {
    return text.split(/\n?---\n?/).map(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        const title = lines[0] || 'Slide';
        const bullets = lines.slice(1).map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
        return { title, bullets };
    }).filter(s => s.title);
}

export default {
    name: 'topowerpoint',
    alias: ['toppt', 'topptx', 'txt2ppt', 'makeppt', 'makeslides'],
    description: 'Convert text into a PowerPoint (.pptx) presentation',
    category: 'converter',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text;
        const inputText = args.join(' ').trim() || quotedText?.trim();
        
        if (!inputText) {
            await xcasper.sendMessage(chatId, { 
                text: `📊 *TEXT TO POWERPOINT*\n\n📝 *Usage:*\n   • ${prefix}topowerpoint [your text]\n   • ${prefix}toppt [your text]\n   • Or reply to a text message\n\n📋 *Format:*\nSlide 1 Title\nFirst bullet\nSecond bullet\n---\nSlide 2 Title\nAnother bullet\n\n> topowerpoint  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📊 *Creating PowerPoint...*\n\n> topowerpoint  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const slides = parseSlides(inputText);
            
            if (slides.length === 0) {
                throw new Error('No slides detected');
            }
            
            const prs = new pptxgen();
            prs.layout = 'LAYOUT_WIDE';
            prs.author = 'ALICIAH AI';
            prs.subject = 'Generated Presentation';
            
            const BG_COLORS = ['FFFFFF', 'F2F7FF', 'FFF8F0', 'F0FFF4', 'FFF0F5'];
            const ACCENT_COLORS = ['1F3864', '2E75B6', 'C55A11', '375623', '833C6E'];
            
            slides.forEach(({ title, bullets }, idx) => {
                const bgColor = BG_COLORS[idx % BG_COLORS.length];
                const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                
                const slide = prs.addSlide();
                slide.background = { color: bgColor };
                
                slide.addShape(prs.ShapeType.rect, {
                    x: 0, y: 0, w: '100%', h: 1.2,
                    fill: { color: accentColor }
                });
                
                slide.addText(title, {
                    x: 0.4, y: 0.1, w: '90%', h: 1.0,
                    fontSize: 28,
                    bold: true,
                    color: 'FFFFFF',
                    fontFace: 'Calibri',
                    valign: 'middle'
                });
                
                slide.addText(`${idx + 1} / ${slides.length}`, {
                    x: '88%', y: 0.1, w: '10%', h: 1.0,
                    fontSize: 11,
                    color: 'CCCCCC',
                    align: 'right',
                    valign: 'middle'
                });
                
                if (bullets.length > 0) {
                    const bulletObjs = bullets.map(b => ({
                        text: b,
                        options: {
                            bullet: true,
                            fontSize: 20,
                            color: '333333',
                            fontFace: 'Calibri',
                            breakLine: true,
                            paraSpaceAfter: 6
                        }
                    }));
                    
                    slide.addText(bulletObjs, {
                        x: 0.5, y: 1.4, w: '95%', h: 4.2,
                        valign: 'top'
                    });
                }
                
                slide.addText('ALICIAH AI', {
                    x: 0, y: '92%', w: '100%', h: 0.35,
                    fontSize: 9,
                    color: 'AAAAAA',
                    align: 'center',
                    fontFace: 'Calibri'
                });
            });
            
            const buffer = await prs.write({ outputType: 'nodebuffer' });
            
            await xcasper.sendMessage(chatId, {
                document: buffer,
                mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                fileName: `ALICIAH_AI_${Date.now()}.pptx`,
                caption: `✅ *PowerPoint created!*\n\n📊 *Slides:* ${slides.length}\n💾 *Size:* ${(buffer.byteLength / 1024).toFixed(1)} KB\n\n> topowerpoint  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            
            await xcasper.sendMessage(chatId, {
                text: `✅ *Presentation ready!*\n\n> topowerpoint  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
            
        } catch (error) {
            console.error('Topowerpoint error:', error);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Failed:* ${error.message}\n\nMake sure your text follows the format:\nTitle\n- bullet\n- bullet\n---\nNext slide title\n\n> topowerpoint  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

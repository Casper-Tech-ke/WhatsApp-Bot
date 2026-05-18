// commands/general/ping.js
// ALICIAH AI - Simple Ping Command

export default {
    name: 'ping',
    alias: [],
    description: 'Check bot response time',
    category: 'general',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, { BOT_NAME, VERSION }) {
        const chatId = msg.key.remoteJid;
        const start = Date.now();
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const latency = Date.now() - start;
        
        await xcasper.sendMessage(chatId, {
            text: `🏓 *Pong!*\n⚡ ${latency}ms\n\n> ping  ALICIAH | CASPER TECH`
        }, { quoted: msg });
    }
};
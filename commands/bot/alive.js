// commands/general/alive.js
// ALICIAH AI - Alive Status Command

export default {
    name: 'alive',
    alias: ['status', 'check'],
    description: 'Check if ALICIAH AI bot is alive',
    category: 'general',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, {
        OWNER_NUMBER,
        BOT_NAME,
        VERSION,
        isOwner
    }) {
        const chatId = msg.key.remoteJid;
        const senderNumber = (msg.key.participant || chatId).split('@')[0];
        const startTime = Date.now();
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const uptime = formatUptime(process.uptime());
        const latency = Date.now() - startTime;
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        const aliveText = `🤖 *${BOT_NAME} v${VERSION}* ✅\n` +
                         `┌─────────────────────┐\n` +
                         `│ ⚡ Latency: ${latency}ms\n` +
                         `│ ⏰ Uptime: ${uptime}\n` +
                         `│ 💾 Memory: ${memory}MB\n` +
                         `│ 🕐 Time: ${time}\n` +
                         `│ 👑 Owner: +${OWNER_NUMBER || 'Not set'}\n` +
                         `└─────────────────────┘\n\n` +
                         `> alive  ALICIAH | CASPER TECH`;
        
        try {
            await xcasper.sendMessage(chatId, {
                image: { url: 'https://i.ibb.co/j9w6dX67/upload-1779101037132-bc7230b9-jpg.jpg' },
                caption: aliveText
            }, { quoted: msg });
        } catch {
            await xcasper.sendMessage(chatId, { 
                text: `${aliveText}\n⚠️ Image failed to load` 
            }, { quoted: msg });
        }
    }
};

function formatUptime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}
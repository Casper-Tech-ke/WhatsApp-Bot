// commands/restart.js
// Restart Command - Refresh/Restart ALICIAH AI Bot
// Owner Only Command - Powered by CASPER TECH KE

import fs from 'fs';
import { spawn } from 'child_process';

export default {
    name: 'restart',
    alias: ['reboot', 'refresh', 'reset', 'r'],
    description: 'Restart/Refresh the ALICIAH AI bot (Owner only)',
    category: 'owner',
    ownerOnly: true,
    
    async execute(xcasper, msg, args, prefix, {
        OWNER_NUMBER,
        OWNER_JID,
        BOT_NAME,
        VERSION,
        isOwner,
        statusDetector,
        memberDetector
    }) {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        const senderNumber = senderJid.split('@')[0];
        
        // Check if user is owner
        if (!isOwner()) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Access Denied!*\n\nThis command is only available to the bot owner.\n\n👑 *Owner Number:* +${OWNER_NUMBER || 'Not set'}\n🔒 *Your Number:* +${senderNumber}\n\n*Command blocked for security reasons.*` 
            }, { quoted: msg });
            return;
        }
        
        // Parse arguments for different restart modes
        const mode = args[0]?.toLowerCase() || 'normal';
        const waitTime = parseInt(args[1]) || 3000;
        
        // Send restart confirmation message
        let restartMessage = `🔄 *${BOT_NAME} — RESTARTING*\n\n` +
                            `👑 *Owner:* +${senderNumber}\n` +
                            `⏱️ *Restarting in:* ${waitTime/1000} seconds\n` +
                            `📊 *Uptime:* ${formatUptime(process.uptime())}\n\n` +
                            `_The bot will reconnect automatically..._\n\n` +
                            `🤖 *Powered by CASPER TECH KE*`;
        
        await xcasper.sendMessage(chatId, { text: restartMessage }, { quoted: msg });
        
        // Log the restart
        console.log(`\n🔄 [RESTART] initiated by owner ${senderNumber}`);
        
        // Save important data before restart
        await saveBotData(statusDetector, memberDetector);
        
        // Wait for specified delay
        await delay(waitTime);
        
        // Perform restart with auto-reconnect flag
        await restartProcess();
    }
};

async function saveBotData(statusDetector, memberDetector) {
    try {
        if (statusDetector?.saveStatusLogs) {
            statusDetector.saveStatusLogs();
        }
        if (memberDetector?.saveDetectionData) {
            memberDetector.saveDetectionData();
        }
        console.log('💾 Bot data saved');
    } catch (error) {
        console.error('❌ Error saving data:', error.message);
    }
}

async function restartProcess() {
    return new Promise(() => {
        console.log('🚀 Restarting bot process...');
        
        const args = process.argv.slice(1);
        
        // Add auto-start flag to bypass login menu
        const child = spawn(process.argv[0], args, {
            stdio: 'inherit',
            detached: true,
            env: { ...process.env, AUTO_RESTART: 'true' },
            shell: true
        });
        
        child.unref();
        
        setTimeout(() => {
            process.exit(0);
        }, 500);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}
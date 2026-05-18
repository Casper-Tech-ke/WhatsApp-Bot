// commands/os.js
// OS Command - Display System Information for ALICIAH AI
// Powered by CASPER TECH KE

export default {
    name: 'os',
    alias: ['system', 'sysinfo', 'status', 'botstatus', 'info'],
    description: 'Display detailed system information, bot status, and platform details',
    category: 'utility',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, {
        OWNER_NUMBER,
        OWNER_JID,
        OWNER_LID,
        BOT_NAME,
        VERSION,
        isOwner,
        jidManager,
        store,
        statusDetector,
        updatePrefix,
        getCurrentPrefix,
        rateLimiter,
        memberDetector,
        isPrefixless
    }) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderJid = msg.key.participant || chatId;
        const isUserOwner = isOwner();
        
        // Send loading indicator
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🤖 *${BOT_NAME}* — Fetching system information...\n└ ⚙️ Gathering data...` 
        }, { quoted: msg });
        
        // Collect system information - PASS rateLimiter here
        const systemInfo = await getSystemInfo(xcasper, msg, args, isUserOwner, jidManager, memberDetector, statusDetector, rateLimiter);
        
        // Format the OS information based on args
        let response = '';
        
        if (args[0] === 'full' || args[0] === 'all' || args[0] === 'detailed') {
            response = formatFullSystemInfo(systemInfo, BOT_NAME, VERSION, isUserOwner, isPrefixless, getCurrentPrefix);
        } else if (args[0] === 'simple' || args[0] === 'basic') {
            response = formatSimpleSystemInfo(systemInfo, BOT_NAME, VERSION, getCurrentPrefix);
        } else if (args[0] === 'network' || args[0] === 'net') {
            response = formatNetworkInfo(systemInfo);
        } else if (args[0] === 'help') {
            response = formatOSHelp(prefix);
        } else {
            response = formatDefaultSystemInfo(systemInfo, BOT_NAME, VERSION, isUserOwner, isPrefixless, getCurrentPrefix);
        }
        
        // Send the response
        await xcasper.sendMessage(chatId, { text: response, edit: loadingMsg.key });
        
        // Log command usage
        console.log(`[OS Command] Executed by ${senderJid.split('@')[0]} - Type: ${args[0] || 'default'}`);
    }
};

async function getSystemInfo(xcasper, msg, args, isUserOwner, jidManager, memberDetector, statusDetector, rateLimiter) {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const platform = process.platform;
    const arch = process.arch;
    const nodeVersion = process.version;
    const pid = process.pid;
    const title = process.title;
    
    // Get bot specific info
    const ownerInfo = jidManager.getOwnerInfo();
    const memberStats = memberDetector ? memberDetector.getStats() : null;
    const statusStats = statusDetector ? statusDetector.getStats() : null;
    
    // Get WhatsApp connection info
    let connectionInfo = {
        isConnected: xcasper.user ? true : false,
        userId: xcasper.user?.id || 'Unknown',
        userName: xcasper.user?.name || 'Unknown',
        connectedDevices: 0,
        groupCount: 0,
        chatCount: 0
    };
    
    try {
        if (xcasper.store && xcasper.store.chats) {
            const chats = Array.from(xcasper.store.chats.values());
            connectionInfo.chatCount = chats.length;
            connectionInfo.groupCount = chats.filter(c => c.id.endsWith('@g.us')).length;
        }
    } catch (e) {}
    
    // Get rate limiter stats - FIXED: use the passed rateLimiter parameter
    const rateLimiterStats = {
        commandCache: rateLimiter?.commandTimestamps?.size || 0,
        userCache: rateLimiter?.userCooldowns?.size || 0
    };
    
    // Get uptime formatted
    const uptimeSeconds = process.uptime();
    const uptime = {
        seconds: Math.floor(uptimeSeconds),
        minutes: Math.floor(uptimeSeconds / 60),
        hours: Math.floor(uptimeSeconds / 3600),
        days: Math.floor(uptimeSeconds / 86400),
        formatted: formatUptime(uptimeSeconds)
    };
    
    // Get memory formatted
    const memory = {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external),
        arrayBuffers: formatBytes(memoryUsage.arrayBuffers || 0),
        raw: memoryUsage
    };
    
    // Get CPU info
    const cpu = {
        user: formatCPUUsage(cpuUsage.user),
        system: formatCPUUsage(cpuUsage.system),
        total: formatCPUUsage(cpuUsage.user + cpuUsage.system),
        raw: cpuUsage
    };
    
    // Detect environment
    const environment = {
        platform: detectPlatform(),
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production'
    };
    
    // Get message stats from store
    let messageStats = {
        totalProcessed: global.messageLogCounter || 0,
        lastMessage: null
    };
    
    return {
        bot: {
            name: global.BOT_NAME || 'ALICIAH AI',
            version: global.VERSION || '2.0.0',
            owner: ownerInfo,
            uptime,
            memory,
            cpu,
            isOwner: isUserOwner
        },
        system: {
            platform,
            arch,
            nodeVersion,
            pid,
            title,
            environment
        },
        connection: connectionInfo,
        features: {
            memberDetection: memberStats,
            statusDetection: statusStats,
            rateLimiter: rateLimiterStats
        },
        messages: messageStats,
        timestamp: new Date().toISOString()
    };
}

function formatDefaultSystemInfo(info, botName, version, isOwner, isPrefixless, getCurrentPrefix) {
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none' : `"${currentPrefix}"`;
    
    return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *${botName.toUpperCase()} v${version}*
┃  🔗 *Powered by CASPER TECH KE*
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📊 *SYSTEM STATUS*
┃  ├ ⏰ Uptime: ${info.bot.uptime.formatted}
┃  ├ 💾 Memory: ${info.bot.memory.heapUsed} / ${info.bot.memory.heapTotal}
┃  ├ 🖥️ Platform: ${info.system.platform} (${info.system.arch})
┃  └ 🟢 Node.js: ${info.system.nodeVersion}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🤖 *BOT INFO*
┃  ├ 👑 Owner: +${info.bot.owner.ownerNumber || 'Not set'}
┃  ├ 💬 Prefix: ${prefixDisplay}
┃  ├ 📡 Status: ${info.connection.isConnected ? '✅ Connected' : '❌ Disconnected'}
┃  ├ 👥 Groups: ${info.connection.groupCount}
┃  └ 💬 Chats: ${info.connection.chatCount}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📈 *PERFORMANCE*
┃  ├ ⚡ CPU: ${info.bot.cpu.total}
┃  ├ 🔥 Heap: ${((info.bot.memory.raw.heapUsed / info.bot.memory.raw.heapTotal) * 100).toFixed(1)}%
┃  └ 📊 Msgs Processed: ${info.messages.totalProcessed || 0}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

_Use ${currentPrefix}os help for more options_`;
}

function formatFullSystemInfo(info, botName, version, isOwner, isPrefixless, getCurrentPrefix) {
    const currentPrefix = getCurrentPrefix();
    
    let detailed = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *${botName.toUpperCase()} v${version} — FULL SYSTEM REPORT*
┃  🔗 *Powered by CASPER TECH KE*
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📊 *SYSTEM OVERVIEW*
┃  ├ 🖥️ Platform: ${info.system.platform} (${info.system.arch})
┃  ├ 🟢 Node.js: ${info.system.nodeVersion}
┃  ├ 📋 Process ID: ${info.system.pid}
┃  ├ 🏷️ Process Title: ${info.system.title}
┃  └ 🌍 Environment: ${info.system.environment.platform} (${info.system.environment.nodeEnv})
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ⏰ *UPTIME INFORMATION*
┃  ├ 📅 Days: ${info.bot.uptime.days}
┃  ├ 🕐 Hours: ${info.bot.uptime.hours}
┃  ├ ⏱️ Minutes: ${info.bot.uptime.minutes}
┃  └ ⚡ Seconds: ${info.bot.uptime.seconds}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  💾 *MEMORY USAGE*
┃  ├ 📦 RSS: ${info.bot.memory.rss}
┃  ├ 📚 Heap Total: ${info.bot.memory.heapTotal}
┃  ├ 🔥 Heap Used: ${info.bot.memory.heapUsed}
┃  ├ 🔌 External: ${info.bot.memory.external}
┃  └ 🗂️ Array Buffers: ${info.bot.memory.arrayBuffers}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ⚙️ *CPU USAGE*
┃  ├ 👤 User: ${info.bot.cpu.user}
┃  ├ 🖥️ System: ${info.bot.cpu.system}
┃  └ 📊 Total: ${info.bot.cpu.total}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🤖 *BOT CONFIGURATION*
┃  ├ 👑 Owner JID: ${info.bot.owner.ownerJid || 'Not set'}
┃  ├ 📞 Owner Number: +${info.bot.owner.ownerNumber || 'Not set'}
┃  ├ 🔗 Owner LID: ${info.bot.owner.ownerLid || 'None'}
┃  ├ 💬 Current Prefix: ${isPrefixless ? 'none (prefixless)' : currentPrefix}
┃  ├ 🛡️ Whitelist Count: ${info.bot.owner.whitelistCount}
┃  └ 🔐 Is Owner: ${isOwner ? '✅ Yes' : '❌ No'}`;

    if (info.connection.groupCount > 0) {
        detailed += `
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📱 *WHATSAPP CONNECTION*
┃  ├ 🔌 Status: ${info.connection.isConnected ? '✅ Connected' : '❌ Disconnected'}
┃  ├ 🆔 User ID: ${info.connection.userId}
┃  ├ 👤 User Name: ${info.connection.userName}
┃  ├ 👥 Groups Joined: ${info.connection.groupCount}
┃  └ 💬 Total Chats: ${info.connection.chatCount}`;
    }

    if (info.features.memberDetection && info.features.memberDetection.totalEvents > 0) {
        detailed += `
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👥 *MEMBER DETECTION*
┃  ├ 📊 Total Events: ${info.features.memberDetection.totalEvents}
┃  ├ 👥 Groups Tracked: ${info.features.memberDetection.totalGroups}
┃  └ 🔧 Status: ${info.features.memberDetection.enabled ? '✅ Active' : '❌ Disabled'}`;
    }

    if (info.features.statusDetection && info.features.statusDetection.totalDetected > 0) {
        detailed += `
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  👁️ *STATUS DETECTION*
┃  ├ 📊 Total Detected: ${info.features.statusDetection.totalDetected}
┃  ├ 🕒 Last Detection: ${info.features.statusDetection.lastDetection}
┃  └ 🔧 Status: ${info.features.statusDetection.detectionEnabled ? '✅ Active' : '❌ Disabled'}`;
    }

    detailed += `
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🛡️ *RATE LIMITER*
┃  ├ 📝 Command Cache: ${info.features.rateLimiter.commandCache}
┃  └ 👤 User Cache: ${info.features.rateLimiter.userCache}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📊 *MESSAGE STATISTICS*
┃  └ 📨 Total Processed: ${info.messages.totalProcessed || 0}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

_🤖 ALICIAH AI — Advanced WhatsApp Bot Framework_`;

    return detailed;
}

function formatSimpleSystemInfo(info, botName, version, getCurrentPrefix) {
    const currentPrefix = getCurrentPrefix();
    
    return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *${botName} v${version}*
┃  🔗 *CASPER TECH KE*
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ⏰ Uptime: ${info.bot.uptime.formatted}
┃  💾 Memory: ${info.bot.memory.heapUsed}
┃  🖥️ Platform: ${info.system.platform}
┃  👑 Owner: +${info.bot.owner.ownerNumber || 'Not set'}
┃  👥 Groups: ${info.connection.groupCount}
┃  📡 Status: ${info.connection.isConnected ? 'Online ✅' : 'Offline ❌'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

_Use ${currentPrefix}os help for details_`;
}

function formatNetworkInfo(info) {
    return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🌐 *NETWORK & CONNECTION INFO*
┃  🔗 *Powered by CASPER TECH KE*
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📱 *WHATSAPP CONNECTION*
┃  ├ 🔌 Status: ${info.connection.isConnected ? '✅ Connected' : '❌ Disconnected'}
┃  ├ 🆔 User ID: ${info.connection.userId}
┃  ├ 👤 User Name: ${info.connection.userName}
┃  ├ 👥 Groups: ${info.connection.groupCount}
┃  └ 💬 Total Chats: ${info.connection.chatCount}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🌍 *SYSTEM NETWORK*
┃  ├ 🖥️ Platform: ${info.system.platform}
┃  ├ 🏗️ Architecture: ${info.system.arch}
┃  └ 🟢 Node Version: ${info.system.nodeVersion}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}

function formatOSHelp(prefix) {
    return `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *OS COMMAND HELP — ALICIAH AI*
┃  🔗 *Powered by CASPER TECH KE*
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📋 *USAGE:*
┃  └ ${prefix}os [option]
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ⚙️ *OPTIONS:*
┃  ├ (no option) — Default system info
┃  ├ full/detailed/all — Complete system report
┃  ├ simple/basic — Basic system overview
┃  ├ network/net — Network connection info
┃  └ help — Show this help message
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📌 *EXAMPLES:*
┃  ├ ${prefix}os — Show default info
┃  ├ ${prefix}os full — Show detailed report
┃  ├ ${prefix}os simple — Show basic info
┃  └ ${prefix}os network — Show network info
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

_🤖 ALICIAH AI — Advanced WhatsApp Bot Framework_`;
}

// Helper functions
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

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatCPUUsage(microseconds) {
    const milliseconds = microseconds / 1000;
    if (milliseconds < 1000) return `${milliseconds.toFixed(0)}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(2)}s`;
    return `${(milliseconds / 60000).toFixed(2)}m`;
}

function detectPlatform() {
    if (process.env.PANEL) return '📡 Panel';
    if (process.env.HEROKU) return '☁️ Heroku';
    if (process.env.RENDER) return '⚡ Render';
    if (process.env.REPLIT) return '🔄 Replit';
    if (process.env.VERCEL) return '▲ Vercel';
    if (process.env.KOYEB) return '🟣 Koyeb';
    if (process.env.RAILWAY) return '🚂 Railway';
    return '💻 Local/VPS';
}
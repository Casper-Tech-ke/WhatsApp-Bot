// commands/menu.js
// Menu Command - Display ALL commands organized by subfolders
// Shows all commands in one single menu
// Powered by CASPER TECH KE

export default {
    name: 'menu',
    alias: ['help', 'commands', 'cmdlist', 'allcommands'],
    description: 'Display all available commands organized by category',
    category: 'utility',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, {
        BOT_NAME,
        VERSION,
        isOwner,
        commands,
        commandCategories,
        isPrefixless,
        getCurrentPrefix
    }) {
        const chatId = msg.key.remoteJid;
        const currentPrefix = getCurrentPrefix();
        const prefixDisplay = isPrefixless ? '' : currentPrefix;
        
        if (!commandCategories) {
            await xcasper.sendMessage(chatId, { text: '❌ Error: Command categories not loaded yet.' }, { quoted: msg });
            return;
        }
        
        // Show ALL commands in one menu
        await showAllCommands(xcasper, chatId, msg, commandCategories, commands, prefixDisplay, BOT_NAME, VERSION);
    }
};

async function showAllCommands(xcasper, chatId, msg, commandCategories, commands, prefix, botName, version) {
    const totalCommands = commands?.size || 0;
    const categories = Array.from(commandCategories.keys()).sort();
    
    let menuText = `🤖 *${botName.toUpperCase()} v${version}*
🔗 *Powered by CASPER TECH KE*

📊 *TOTAL COMMANDS:* ${totalCommands}

`;
    
    // Loop through each category and list all commands
    for (const category of categories) {
        const cmdList = commandCategories.get(category);
        const emoji = getCategoryEmoji(category);
        
        menuText += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
${emoji} *${category.toUpperCase()}* (${cmdList.length} cmd)
`;
        
        // Sort commands alphabetically
        const sortedCmds = [...cmdList].sort();
        
        for (const cmdName of sortedCmds) {
            const command = commands.get(cmdName);
            // Add permission indicators
            let indicators = '';
            if (command?.ownerOnly) indicators += ' 👑';
            if (command?.adminOnly) indicators += ' 🛡️';
            if (command?.groupOnly) indicators += ' 👥';
            
            menuText += `├ ${prefix}${cmdName}${indicators}\n`;
        }
    }
    
    menuText += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
💡 *EXAMPLE:* ${prefix}os
_🤖 ALICIAH AI — Your Smart Assistant_`;
    
    const thumbnailUrl = 'https://i.ibb.co/j9w6dX67/upload-1779101037132-bc7230b9-jpg.jpg';
    
    try {
        await xcasper.sendMessage(chatId, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: `${botName} v${version}`,
                    body: `${totalCommands} Commands Available`,
                    thumbnailUrl: thumbnailUrl,
                    sourceUrl: "https://whatsapp.com",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    } catch (error) {
        await xcasper.sendMessage(chatId, { text: menuText }, { quoted: msg });
    }
}

function getCategoryEmoji(category) {
    const emojis = {
        'owner': '👑',
        'group': '👥',
        'utility': '🔧',
        'automation': '🤖',
        'bot': '💬',
        'handlers': '⚙️',
        'admin': '🛡️',
        'general': '📋',
        'moderation': '⚖️',
        'fun': '🎮',
        'media': '🎵',
        'download': '📥',
        'search': '🔍',
        'ai': '🧠',
        'tools': '🛠️'
    };
    return emojis[category.toLowerCase()] || '📁';
}
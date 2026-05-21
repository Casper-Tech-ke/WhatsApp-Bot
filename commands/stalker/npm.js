// commands/stalker/npm.js
// ALICIAH AI - NPM Stalker
// Get detailed NPM package information
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'npmstalk',
    alias: ['npm', 'npminfo', 'npmpkg', 'package'],
    description: 'Get detailed NPM package information with dependencies and stats',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Normal package lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `📦 *NPM STALKER*\n\n📝 *Usage:* ${prefix}npmstalk [package_name]\n💬 *Example:* ${prefix}npmstalk baileys\n\n🔍 *Also try:* ${prefix}npmstalk react | ${prefix}npmstalk axios\n\n> npmstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const packageName = args[0];
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `📦 *Fetching NPM package:* ${packageName}\n\n> npmstalk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/npm?package=${encodeURIComponent(packageName)}`);
            
            if (response.data?.success) {
                const details = response.data.details;
                
                let resultText = `📦 *NPM PACKAGE: ${details.name}*\n\n`;
                
                // Basic Info
                resultText += `📝 *Description:* ${details.description || 'No description'}\n`;
                resultText += `🏷️ *Version:* ${details.version}\n`;
                resultText += `👤 *Publisher:* ${details.publisher}\n`;
                resultText += `📜 *License:* ${details.license || 'Not specified'}\n`;
                
                if (details.homepage) {
                    resultText += `🏠 *Homepage:* ${details.homepage}\n`;
                }
                
                if (details.repository) {
                    // Clean up repository URL
                    let repoUrl = details.repository
                        .replace('ssh://git@github.com/', 'https://github.com/')
                        .replace('.git', '');
                    resultText += `📁 *Repository:* ${repoUrl}\n`;
                }
                
                resultText += `\n📊 *STATISTICS*\n`;
                resultText += `📥 *Weekly Downloads:* ${details.weeklyDownloads?.toLocaleString() || 'N/A'}\n`;
                resultText += `📅 *Last Published:* ${details.lastPublish}\n`;
                
                // Maintainers
                if (details.maintainers?.length) {
                    resultText += `👥 *Maintainers (${details.maintainers.length}):*\n`;
                    resultText += `${details.maintainers.join(', ')}\n`;
                }
                
                // Keywords
                if (details.keywords?.length) {
                    resultText += `\n🏷️ *KEYWORDS*\n`;
                    resultText += `${details.keywords.map(k => `#${k}`).join(', ')}\n`;
                }
                
                // Dependencies
                if (details.dependencies?.length) {
                    resultText += `\n📚 *DEPENDENCIES (${details.dependencies.length})*\n`;
                    const depsToShow = details.dependencies.slice(0, 8);
                    depsToShow.forEach(dep => {
                        resultText += `  • ${dep}\n`;
                    });
                    if (details.dependencies.length > 8) {
                        resultText += `  ... and ${details.dependencies.length - 8} more\n`;
                    }
                }
                
                // Dev Dependencies
                if (details.devDependencies?.length) {
                    resultText += `\n🔧 *DEV DEPENDENCIES (${details.devDependencies.length})*\n`;
                    const devDepsToShow = details.devDependencies.slice(0, 8);
                    devDepsToShow.forEach(dep => {
                        resultText += `  • ${dep}\n`;
                    });
                    if (details.devDependencies.length > 8) {
                        resultText += `  ... and ${details.devDependencies.length - 8} more\n`;
                    }
                }
                
                resultText += `\n🔗 *NPM:* ${details.npmLink}\n\n`;
                resultText += `> npmstalk  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                
                // Edit loading message to show success
                await xcasper.sendMessage(chatId, {
                    text: `✅ *Package fetched:* ${details.name}\n\n📦 v${details.version} | 📥 ${details.weeklyDownloads?.toLocaleString() || 'N/A'} weekly DLs | 📜 ${details.license || 'N/A'}\n\n> npmstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Package not found*\n\nCould not find NPM package: ${packageName}\n\n💡 Make sure the package name is correct.\n\n> npmstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('NPM stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `Package "${packageName}" not found on NPM`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> npmstalk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

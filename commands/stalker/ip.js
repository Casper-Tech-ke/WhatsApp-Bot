// commands/stalker/ip.js
// ALICIAH AI - IP Stalker
// Get detailed IP address information including location, network, and security
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'ipstalk',
    alias: ['ip', 'iptrack', 'ipinfo', 'lookup', 'ips'],
    description: 'Get detailed IP address information with location and network details',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Normal IP lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🌍 *IP STALKER*\n\n📝 *Usage:* ${prefix}ipstalk [ip_address]\n💬 *Example:* ${prefix}ipstalk 8.8.8.8\n\n🔍 *Also try:* ${prefix}ipstalk 1.1.1.1 | ${prefix}ipstalk myip\n\n> ipstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const ip = args[0];
        
        // Basic IP format validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const validKeywords = ['myip', 'me', 'mine'];
        
        if (!ipRegex.test(ip) && !validKeywords.includes(ip.toLowerCase())) {
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Invalid IP address format*\n\nPlease provide a valid IPv4 address (e.g., 8.8.8.8) or use "myip".\n\n> ipstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🌍 *Fetching IP information:* ${ip}\n\n> ipstalk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            // If user wants their own IP, use a special endpoint or the IP parameter
            const queryIP = validKeywords.includes(ip.toLowerCase()) ? '' : ip;
            const apiUrl = validKeywords.includes(ip.toLowerCase()) 
                ? 'https://apis.xcasper.space/api/stalker/ip'
                : `https://apis.xcasper.space/api/stalker/ip?ip=${encodeURIComponent(queryIP)}`;
            
            const response = await axios.get(apiUrl);
            
            if (response.data?.success) {
                const data = response.data;
                const location = data.location;
                const network = data.network;
                const security = data.security;
                
                let resultText = `🌍 *IP LOOKUP RESULTS*\n\n`;
                resultText += `🔢 *IP Address:* ${data.ip}\n\n`;
                
                // Location
                if (location) {
                    resultText += `📍 *LOCATION*\n`;
                    resultText += `🌎 *Continent:* ${location.continent}\n`;
                    resultText += `🏳️ *Country:* ${location.country} (${location.country_code})\n`;
                    resultText += `🏛️ *Region:* ${location.region_name} (${location.region})\n`;
                    resultText += `🏙️ *City:* ${location.city}\n`;
                    resultText += `📮 *ZIP Code:* ${location.zip}\n`;
                    resultText += `🗺️ *Coordinates:* ${location.lat}, ${location.lon}\n`;
                    resultText += `🕐 *Timezone:* ${location.timezone}\n`;
                    if (location.map_url) {
                        resultText += `🗺️ *Map:* ${location.map_url}\n`;
                    }
                    resultText += `\n`;
                }
                
                // Network
                if (network) {
                    resultText += `🌐 *NETWORK*\n`;
                    if (network.isp) resultText += `📡 *ISP:* ${network.isp}\n`;
                    if (network.org) resultText += `🏢 *Organization:* ${network.org}\n`;
                    if (network.as) resultText += `🔢 *AS:* ${network.as}\n`;
                    if (network.asname) resultText += `📛 *AS Name:* ${network.asname}\n`;
                    if (network.hostname) resultText += `🖥️ *Hostname:* ${network.hostname}\n`;
                    if (network.reverse) resultText += `🔄 *Reverse DNS:* ${network.reverse}\n`;
                    resultText += `\n`;
                }
                
                // Security
                if (security) {
                    resultText += `🔒 *SECURITY*\n`;
                    resultText += `🛡️ *Proxy/VPN:* ${security.proxy ? 'Yes ⚠️' : 'No ✅'}\n`;
                    resultText += `📱 *Mobile:* ${security.mobile ? 'Yes 📱' : 'No 💻'}\n`;
                    resultText += `🏢 *Hosting/Datacenter:* ${security.hosting ? 'Yes 🖥️' : 'No 🏠'}\n`;
                    resultText += `\n`;
                }
                
                // Sources
                if (data.sources) {
                    resultText += `✅ *Data Sources:* `;
                    const sources = [];
                    if (data.sources.ip_api === 'success') sources.push('IP-API');
                    if (data.sources.ipinfo === 'success') sources.push('IPinfo');
                    resultText += sources.join(', ');
                    resultText += `\n\n`;
                }
                
                // Processing time
                if (data.processing_time) {
                    resultText += `⏱️ *Processing Time:* ${data.processing_time}ms\n`;
                }
                
                if (data.cached) {
                    resultText += `💾 *Cached:* Yes\n`;
                }
                
                resultText += `\n> ipstalk  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                
                // Edit loading message to show success
                await xcasper.sendMessage(chatId, {
                    text: `✅ *IP lookup complete:* ${data.ip}\n\n📍 ${location?.city || 'Unknown'}, ${location?.country || 'Unknown'} | 📡 ${network?.isp || 'Unknown ISP'}\n\n> ipstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *IP lookup failed*\n\nCould not find information for IP: ${ip}\n\n💡 Make sure the IP address is valid and reachable.\n\n> ipstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('IP stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `IP "${ip}" not found or invalid`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> ipstalk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

// commands/stalker/dns.js
// ALICIAH AI - DNS Stalker
// Get detailed DNS information for any domain
// Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'dnsstalk',
    alias: ['dns', 'dnslookup', 'domain', 'whois', 'dnsinfo'],
    description: 'Get detailed DNS records and domain information',
    category: 'stalker',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Normal domain lookup
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🔍 *DNS STALKER*\n\n📝 *Usage:* ${prefix}dnsstalk [domain]\n💬 *Example:* ${prefix}dnsstalk xcasper.space\n\n🔍 *Also try:* ${prefix}dnsstalk google.com | ${prefix}dnsstalk github.com\n\n> dnsstalk  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const domain = args[0].replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
        
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🔍 *Fetching DNS info for:* ${domain}\n\n> dnsstalk  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/stalker/dns?domain=${encodeURIComponent(domain)}`);
            
            if (response.data?.success) {
                const data = response.data;
                const summary = data.summary;
                const dns = data.dns;
                const emailSecurity = data.emailSecurity;
                const security = data.security;
                const server = data.server;
                
                let resultText = `🔍 *DNS LOOKUP: ${data.domain}*\n\n`;
                
                // Summary
                if (summary) {
                    resultText += `📋 *SUMMARY*\n`;
                    
                    if (summary.ipAddresses?.length) {
                        resultText += `🌐 *IPv4:* ${summary.ipAddresses.join(', ')}\n`;
                    }
                    
                    if (summary.ipv6Addresses?.length) {
                        resultText += `🌐 *IPv6:* ${summary.ipv6Addresses[0]}\n`;
                        if (summary.ipv6Addresses.length > 1) {
                            resultText += `   +${summary.ipv6Addresses.length - 1} more\n`;
                        }
                    }
                    
                    if (summary.mailServers?.length) {
                        resultText += `📧 *Mail Servers:* ${summary.mailServers.join(', ')}\n`;
                    }
                    
                    if (summary.nameServers?.length) {
                        resultText += `🖧 *Name Servers:* ${summary.nameServers.join(', ')}\n`;
                    }
                    
                    if (summary.webServer) {
                        resultText += `🖥️ *Web Server:* ${summary.webServer}\n`;
                    }
                    
                    if (summary.poweredBy) {
                        resultText += `⚡ *Powered By:* ${summary.poweredBy}\n`;
                    }
                    
                    resultText += `🔒 *SSL:* ${summary.ssl ? 'Yes ✅' : 'No ❌'}\n`;
                    resultText += `☁️ *Cloudflare:* ${summary.cloudflare ? 'Yes ☁️' : 'No'}\n`;
                    resultText += `📡 *Status:* ${summary.statusCode}\n\n`;
                }
                
                // DNS Records
                if (dns) {
                    resultText += `📚 *DNS RECORDS (${dns.totalRecords} total)*\n`;
                    
                    if (dns.A?.length) {
                        resultText += `\n📌 *A Records (${dns.A.length})*\n`;
                        dns.A.forEach(record => {
                            resultText += `  • ${record.data} (TTL: ${record.ttl}s)\n`;
                        });
                    }
                    
                    if (dns.AAAA?.length) {
                        resultText += `\n📌 *AAAA Records (${dns.AAAA.length})*\n`;
                        dns.AAAA.forEach(record => {
                            resultText += `  • ${record.data.substring(0, 30)}... (TTL: ${record.ttl}s)\n`;
                        });
                    }
                    
                    if (dns.CNAME?.length) {
                        resultText += `\n📌 *CNAME Records*\n`;
                        dns.CNAME.forEach(record => {
                            resultText += `  • ${record.data} (TTL: ${record.ttl}s)\n`;
                        });
                    }
                    
                    if (dns.MX?.length) {
                        resultText += `\n📌 *MX Records (${dns.MX.length})*\n`;
                        dns.MX.forEach(record => {
                            resultText += `  • ${record.data} (TTL: ${record.ttl}s)\n`;
                        });
                    }
                    
                    if (dns.NS?.length) {
                        resultText += `\n📌 *NS Records (${dns.NS.length})*\n`;
                        dns.NS.forEach(record => {
                            resultText += `  • ${record.data} (TTL: ${record.ttl}s)\n`;
                        });
                    }
                    
                    if (dns.TXT?.length) {
                        resultText += `\n📌 *TXT Records (${dns.TXT.length})*\n`;
                        dns.TXT.slice(0, 3).forEach(record => {
                            const txtData = record.data.length > 50 ? record.data.substring(0, 50) + '...' : record.data;
                            resultText += `  • ${txtData} (TTL: ${record.ttl}s)\n`;
                        });
                        if (dns.TXT.length > 3) {
                            resultText += `  ... and ${dns.TXT.length - 3} more TXT records\n`;
                        }
                    }
                    
                    resultText += `\n`;
                }
                
                // Email Security
                if (emailSecurity) {
                    resultText += `📧 *EMAIL SECURITY*\n`;
                    resultText += `🛡️ *SPF:* ${emailSecurity.spf ? 'Yes ✅' : 'No ❌'}\n`;
                    resultText += `🔐 *DMARC:* ${emailSecurity.dmarc ? 'Yes ✅' : 'No ❌'}\n`;
                    resultText += `🔑 *DKIM:* ${emailSecurity.dkim ? 'Yes ✅' : 'No ❌'}\n\n`;
                }
                
                // Security Headers
                if (security?.headers) {
                    const headers = security.headers;
                    const secureHeaders = Object.entries(headers).filter(([key, value]) => value === true);
                    const insecureHeaders = Object.entries(headers).filter(([key, value]) => value === false);
                    
                    resultText += `🔒 *SECURITY HEADERS*\n`;
                    resultText += `✅ *Present:* ${secureHeaders.length}/${Object.keys(headers).length}\n`;
                    
                    if (insecureHeaders.length > 0) {
                        resultText += `❌ *Missing:* `;
                        const missingList = insecureHeaders.map(([key]) => {
                            const names = {
                                'strict-transport-security': 'HSTS',
                                'x-frame-options': 'X-Frame',
                                'x-content-type-options': 'X-Content-Type',
                                'content-security-policy': 'CSP',
                                'x-xss-protection': 'X-XSS',
                                'referrer-policy': 'Referrer-Policy'
                            };
                            return names[key] || key;
                        });
                        resultText += missingList.join(', ') + '\n';
                    }
                    resultText += `\n`;
                }
                
                // Server Info
                if (server) {
                    resultText += `🖥️ *SERVER INFO*\n`;
                    resultText += `📡 *Status:* ${server.statusCode} ${server.statusText}\n`;
                    resultText += `🔒 *SSL:* ${server.ssl ? 'Yes ✅' : 'No ❌'}\n`;
                    resultText += `🔄 *Redirected:* ${server.redirected ? 'Yes' : 'No'}\n`;
                    if (server.headers?.server) {
                        resultText += `🖥️ *Server:* ${server.headers.server}\n`;
                    }
                    if (server.headers?.['x-powered-by']) {
                        resultText += `⚡ *Powered By:* ${server.headers['x-powered-by']}\n`;
                    }
                }
                
                resultText += `\n> dnsstalk  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, { text: resultText }, { quoted: msg });
                
                // Edit loading message to show success
                await xcasper.sendMessage(chatId, {
                    text: `✅ *DNS lookup complete:* ${data.domain}\n\n🌐 IPs: ${summary?.ipAddresses?.length || 0} | 🔒 SSL: ${summary?.ssl ? 'Yes' : 'No'} | ☁️ CF: ${summary?.cloudflare ? 'Yes' : 'No'}\n\n> dnsstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
                
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Domain lookup failed*\n\nCould not find DNS info for: ${domain}\n\n💡 Make sure the domain is valid and try without http/https.\n\n> dnsstalk  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('DNS stalker error:', error);
            
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = `Domain "${domain}" not found or unreachable`;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                errorMessage = 'API server is unreachable. Please try again later.';
            }
            
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error:* ${errorMessage}\n\n> dnsstalk  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

// commands/search/weather.js
// ALICIAH AI - Weather Search
// Get current weather and forecast - Powered by CASPER TECH KE

import axios from 'axios';

export default {
    name: 'weather',
    alias: ['wthr', 'forecast', 'climate'],
    description: 'Get current weather and forecast for any location',
    category: 'search',
    ownerOnly: false,
    
    async execute(xcasper, msg, args, prefix, context) {
        const chatId = msg.key.remoteJid;
        
        if (!args.length) {
            await xcasper.sendMessage(chatId, { 
                text: `🌤️ *WEATHER FORECAST*\n\n📝 *Usage:* ${prefix}weather [location]\n💬 *Examples:*\n   • ${prefix}weather London\n   • ${prefix}weather Nairobi\n   • ${prefix}weather New York\n\n📊 *Returns:*\n   • Current temperature (°C/°F)\n   • Conditions, humidity, wind\n   • 3-day forecast\n\n> weather  ALICIAH | CASPER TECH`
            }, { quoted: msg });
            return;
        }
        
        const location = args.join(' ');
        await xcasper.sendPresenceUpdate('composing', chatId);
        
        const loadingMsg = await xcasper.sendMessage(chatId, { 
            text: `🌤️ *Checking weather for:* "${location}"\n\nPlease wait...\n\n> weather  ALICIAH | CASPER TECH`
        }, { quoted: msg });
        
        try {
            const response = await axios.get(`https://apis.xcasper.space/api/search/weather?location=${encodeURIComponent(location)}`, {
                timeout: 10000
            });
            
            if (response.data && response.data.success) {
                const current = response.data;
                const forecast = current.forecast || [];
                
                // Weather icon based on condition
                const weatherIcon = getWeatherIcon(current.condition);
                
                // Current weather
                let resultText = `${weatherIcon} *WEATHER IN ${current.location.toUpperCase()}* ${weatherIcon}\n`;
                resultText += `📍 ${current.location}, ${current.country}\n`;
                resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                resultText += `🌡️ *Temperature:* ${current.temperature.celsius}°C / ${current.temperature.fahrenheit}°F\n`;
                resultText += `🌡️ *Feels like:* ${current.temperature.feels_like_c}°C / ${current.temperature.feels_like_f}°F\n`;
                resultText += `☁️ *Condition:* ${current.condition}\n`;
                resultText += `💧 *Humidity:* ${current.humidity}%\n`;
                resultText += `💨 *Wind:* ${current.wind.speed_kmph} km/h (${current.wind.speed_mph} mph) ${current.wind.direction}\n`;
                resultText += `👁️ *Visibility:* ${current.visibility_km} km\n`;
                resultText += `📊 *Pressure:* ${current.pressure_mb} mb\n`;
                resultText += `☀️ *UV Index:* ${current.uv_index}\n`;
                resultText += `☁️ *Cloud cover:* ${current.cloud_cover}%\n`;
                resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                // Forecast
                if (forecast.length > 0) {
                    resultText += `📅 *3-DAY FORECAST*\n`;
                    resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    
                    for (const day of forecast.slice(0, 3)) {
                        const dayIcon = getWeatherIcon(day.condition);
                        resultText += `${dayIcon} *${formatDate(day.date)}*\n`;
                        resultText += `   🌡️ ${day.max_c}°C / ${day.min_c}°C (${day.max_f}°F / ${day.min_f}°F)\n`;
                        resultText += `   ☁️ ${day.condition}\n`;
                        resultText += `   🌧️ Rain chance: ${day.chance_of_rain}%\n\n`;
                    }
                }
                
                resultText += `> weather  ALICIAH | CASPER TECH`;
                
                await xcasper.sendMessage(chatId, { text: resultText, edit: loadingMsg.key });
            } else {
                await xcasper.sendMessage(chatId, { 
                    text: `❌ *Location not found*\n\nCould not find weather for: "${location}"\n\n💡 *Tips:*\n• Use city name (e.g., London)\n• Use city, country (e.g., Paris, France)\n• Check spelling\n\n> weather  ALICIAH | CASPER TECH`,
                    edit: loadingMsg.key
                });
            }
        } catch (error) {
            console.error('Weather API Error:', error.message);
            await xcasper.sendMessage(chatId, { 
                text: `❌ *Error fetching weather*\n\n${error.message}\n\nPlease try again later.\n\n> weather  ALICIAH | CASPER TECH`,
                edit: loadingMsg.key
            });
        }
    }
};

function getWeatherIcon(condition) {
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return '☀️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️';
    if (cond.includes('thunder') || cond.includes('storm')) return '⛈️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('fog') || cond.includes('mist')) return '🌫️';
    if (cond.includes('wind')) return '💨';
    return '🌤️';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

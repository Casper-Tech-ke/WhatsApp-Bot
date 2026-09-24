export default {
    name: 'chatbot',
    alias: ['alice', 'alicebot'],
    description: 'Toggle the Alice assistant for groups and DMs.',
    category: 'bot',
    ownerOnly: false,

    async execute(xcasper, msg, args, prefix, context = {}) {
        const chatId = msg.key.remoteJid;
        const mode = (args[0] || 'status').toLowerCase();
        const isAuthorized = context.isOwner?.() || context.isDev?.() || context.isSudo?.();

        if (!isAuthorized) {
            await xcasper.sendMessage(chatId, {
                text: '❌ *Chatbot Control Restricted*\n\nOnly the owner, dev, or sudo users can enable or disable Alice.'
            }, { quoted: msg });
            return;
        }

        const onModes = ['on', 'enable', 'start', 'activate'];
        const offModes = ['off', 'disable', 'stop', 'deactivate'];

        if (mode === 'status' || mode === 'state') {
            const enabled = !!context.isAliceEnabled?.();
            await xcasper.sendMessage(chatId, {
                text: `🤖 *Alice Chatbot Status*\n\n${enabled ? '✅ Enabled' : '❌ Disabled'}\n\nUse:\n• \`${prefix}chatbot on\`\n• \`${prefix}chatbot off\`\n• \`${prefix}chatbot status\``
            }, { quoted: msg });
            return;
        }

        if (onModes.includes(mode)) {
            context.setAliceEnabled?.(true);
            await xcasper.sendMessage(chatId, {
                text: '✅ *Alice Chatbot Enabled*\n\nThe assistant is now active in groups and DMs and will respond when mentioned or quoted.'
            }, { quoted: msg });
            return;
        }

        if (offModes.includes(mode)) {
            context.setAliceEnabled?.(false);
            await xcasper.sendMessage(chatId, {
                text: '🛑 *Alice Chatbot Disabled*\n\nThe assistant is off until enabled again by an owner, dev, or sudo user.'
            }, { quoted: msg });
            return;
        }

        await xcasper.sendMessage(chatId, {
            text: `❌ *Usage:* \`${prefix}chatbot on|off|status\`\n\nExamples:\n• \`${prefix}chatbot on\`\n• \`${prefix}chatbot off\`\n• \`${prefix}chatbot status\``
        }, { quoted: msg });
    }
};

import { resolveProfileTarget } from '../../lib/channelHelpers.js';

export default {
    name: 'getpp',
    alias: ['profilepic', 'getprofilepic', 'profilepicture'],
    description: 'Get an available profile picture for an account, group/community, or channel.',
    category: 'tools',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const chatId = msg.key.remoteJid;
        const target = await resolveProfileTarget(xcasper, msg, args);
        if (!target.jid) {
            return xcasper.sendMessage(chatId, {
                text: `❌ ${target.error}\n\n*Usage:* Reply to a message or use \`${prefix}getpp 254700000000\`.`
            }, { quoted: msg });
        }

        const isSharedChat = chatId.endsWith('@g.us') || chatId.endsWith('@newsletter');
        const isAccountTarget = target.type === 'account' || target.type === 'linked device';
        if (isSharedChat && isAccountTarget) {
            return xcasper.sendMessage(chatId, {
                text: '❌ For privacy, account profile pictures can only be retrieved in a direct chat with the bot. Group, community, and channel pictures can be retrieved in their own chats.'
            }, { quoted: msg });
        }

        try {
            const imageUrl = await xcasper.profilePictureUrl(target.jid, 'image');
            if (!imageUrl) {
                return xcasper.sendMessage(chatId, {
                    text: `ℹ️ No profile picture is available for this ${target.type}.`
                }, { quoted: msg });
            }

            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`image download failed (${response.status})`);
            const image = Buffer.from(await response.arrayBuffer());

            await xcasper.sendMessage(chatId, {
                image,
                caption: `🖼️ *Profile picture*\n🏷️ *Type:* ${target.type}`
            }, { quoted: msg });
        } catch (error) {
            await xcasper.sendMessage(chatId, {
                text: `❌ Could not get this profile picture. It may be private or unavailable.\n\n${error.message}`
            }, { quoted: msg });
        }
    }
};
import { buildGroupCtx, fetchGroupCtx } from '../../lib/groupHelpers.js';
import { getQuotedImageBuffer } from '../../lib/mediaHelpers.js';

export default {
    name: 'setgcpp',
    alias: ['setgrouppp', 'setgcpp', 'gcpp', 'setgroupimage'],
    description: 'Reply to an image to set the current group profile picture.',
    category: 'group',

    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, reply, react, botPrefix } = base;
        const { isGroup, isBotAdmin, isAdmin, isSuperAdmin, isSuperUser } = await fetchGroupCtx(xcasper, msg, ctx);

        if (!isGroup) return reply('❌ This command only works in groups.');
        if (!isBotAdmin) return reply('❌ Bot is not an admin in this group.');
        if (!isAdmin && !isSuperAdmin && !isSuperUser) return reply('❌ You must be a group admin to change the group picture.');

        const image = await getQuotedImageBuffer(msg);
        if (!image.ok) return reply(`❌ ${image.error}\n\n*Usage:* Reply to an image with \`${botPrefix}setgcpp\`.`);

        try {
            await react('⏳');
            await xcasper.updateProfilePicture(from, image.buffer);
            await react('✅');
            return reply('✅ Group profile picture updated.');
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to update the group picture: ${error.message}`);
        }
    }
};
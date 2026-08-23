import { buildGroupCtx } from '../../lib/groupHelpers.js';

function buildGroupLines(groups) {
    return groups
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((group, index) => [
            `*${index + 1}. ${group.name}*`,
            `🆔 \`${group.jid}\``,
            `👥 ${group.members} member${group.members === 1 ? '' : 's'}`
        ].join('\n'));
}

function splitMessage(header, lines, maxLength = 3500) {
    const messages = [];
    let current = header;
    for (const line of lines) {
        const next = `${current}\n\n${line}`;
        if (next.length > maxLength && current !== header) {
            messages.push(current);
            current = `${header}\n\n${line}`;
        } else {
            current = next;
        }
    }
    if (current) messages.push(current);
    return messages;
}

export default {
    name: 'mygroups',
    alias: ['grouplist', 'allgroups', 'botgroups'],
    description: 'List the groups the bot currently participates in.',
    category: 'group',
    ownerOnly: true,

    async execute(xcasper, msg, args, prefix) {
        const { from, reply, react, mek } = buildGroupCtx(xcasper, msg, args, prefix);
        const isDirectChat = from.endsWith('@s.whatsapp.net') || from.endsWith('@lid');

        if (!isDirectChat) {
            return reply('❌ For privacy, use this command in a direct chat with the bot.');
        }

        try {
            await react('⏳');
            const metadataByJid = await xcasper.groupFetchAllParticipating();
            const groups = Object.entries(metadataByJid || {}).map(([jid, metadata]) => ({
                jid,
                name: metadata?.subject || 'Unnamed group',
                members: metadata?.size ?? metadata?.participants?.length ?? 0
            }));

            if (groups.length === 0) {
                await react('📭');
                return reply('📭 The bot is not currently participating in any groups.');
            }

            const header = `👥 *BOT GROUPS*\n\n📊 Total: *${groups.length}* group${groups.length === 1 ? '' : 's'}`;
            const messages = splitMessage(header, buildGroupLines(groups));
            for (const [index, text] of messages.entries()) {
                await xcasper.sendMessage(from, { text }, { quoted: index === 0 ? mek : undefined });
            }
            await react('✅');
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to retrieve the bot's group list: ${error.message}`);
        }
    }
};
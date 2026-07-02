import { buildGroupCtx, getLidMapping } from '../../lib/groupHelpers.js';

export default {
    name: 'online',
    alias: ['listonline', 'whosonline'],
    description: 'List members who are currently typing/recording in the group',
    category: 'group',
    async execute(xcasper, msg, args, prefix, ctx) {
        const base = buildGroupCtx(xcasper, msg, args, prefix);
        const { from, isGroup, reply, react, mek } = base;

        if (!isGroup) return reply('❌ This command only works in groups!');

        try {
            await reply('🔍 Checking active members... Please wait...');
            const groupMeta = await xcasper.groupMetadata(from);
            const participants = groupMeta.participants;

            const onlineMembers = [];
            const presenceData = new Map();

            const presenceHandler = (update) => {
                if (update.presences) {
                    for (const [jid, presence] of Object.entries(update.presences)) {
                        presenceData.set(jid, presence);
                        presenceData.set(jid.split('@')[0], presence);
                    }
                }
            };

            xcasper.ev.on('presence.update', presenceHandler);

            try {
                const batchSize = 5;
                for (let i = 0; i < participants.length; i += batchSize) {
                    const batch = participants.slice(i, i + batchSize);
                    await Promise.all(batch.map(async p => {
                        try { await xcasper.presenceSubscribe(p.id || p.jid); } catch {}
                    }));
                    await new Promise(r => setTimeout(r, 500));
                }
                await new Promise(r => setTimeout(r, 2000));

                for (const p of participants) {
                    const participantId = p.id || p.jid;
                    const numOnly = participantId.split('@')[0];
                    let presence = presenceData.get(participantId) || presenceData.get(numOnly);
                    if (!presence && p.pn) presence = presenceData.get(p.pn) || presenceData.get(p.pn.split('@')[0]);

                    if (['composing', 'recording', 'available'].includes(presence?.lastKnownPresence)) {
                        let displayJid = participantId;
                        if (participantId.endsWith('@lid')) {
                            const cached = getLidMapping(participantId);
                            if (cached) displayJid = cached;
                            else if (p.pn) displayJid = p.pn;
                        }
                        const number = displayJid.split('@')[0];
                        const name = p.notify || p.name || number;
                        onlineMembers.push({ jid: displayJid, name, number });
                    }
                }
            } finally {
                xcasper.ev.off('presence.update', presenceHandler);
            }

            if (onlineMembers.length === 0) {
                await react('😴');
                return reply('😴 No members are currently typing or recording.\n\n_Note: This only detects active typing/recording presence._');
            }

            const mentions = onlineMembers.map(m => m.jid);
            const memberList = onlineMembers.map((m, i) => `${i + 1}. @${m.name}`).join('\n');
            const message = `🟢 *ACTIVE MEMBERS (Typing/Recording)*\n\n📊 *${onlineMembers.length}* of *${participants.length}* members active\n\n${memberList}\n\n_Note: Only shows members currently typing or recording._`;

            await react('✅');
            await xcasper.sendMessage(from, { text: message, mentions }, { quoted: mek });
        } catch (error) {
            await react('❌');
            return reply(`❌ Failed to check online members: ${error.message}`);
        }
    }
};

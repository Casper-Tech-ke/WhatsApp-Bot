// ============================================================
//  ALICIAH AI — OPEN SOURCE EDITION
//  🤖 ALICIAH AI — WhatsApp Bot Framework
//  Powered by CASPER TECH KE
// ============================================================

const originalConsoleMethods = {
    log: console.log, info: console.info, warn: console.warn,
    error: console.error, debug: console.debug, trace: console.trace,
    dir: console.dir, dirxml: console.dirxml, table: console.table,
    time: console.time, timeEnd: console.timeEnd, timeLog: console.timeLog,
    group: console.group, groupEnd: console.groupEnd, groupCollapsed: console.groupCollapsed,
    clear: console.clear, count: console.count, countReset: console.countReset,
    assert: console.assert, profile: console.profile, profileEnd: console.profileEnd,
    timeStamp: console.timeStamp, context: console.context
};

const shouldShowLog = (args) => {
    if (args.length === 0) return true;
    const firstArg = args[0];
    if (typeof firstArg !== 'string') return true;
    const lowerMsg = firstArg.toLowerCase();
    if (lowerMsg.includes('command') ||
        lowerMsg.includes('✅') || lowerMsg.includes('❌') ||
        lowerMsg.includes('👥') || lowerMsg.includes('👤')) return true;
    if (!lowerMsg.includes('baileys') && !lowerMsg.includes('signal') &&
        !lowerMsg.includes('session') && !lowerMsg.includes('buffer') &&
        !lowerMsg.includes('key')) return true;
    const noisyPatterns = ['closing session', 'sessionentry', 'registrationid',
        'currentratchet', 'buffer', '05 ', '0x', 'failed to decrypt', 'reconnect', 'disconnect'];
    return !noisyPatterns.some(pattern => lowerMsg.includes(pattern));
};

for (const method of Object.keys(originalConsoleMethods)) {
    if (typeof console[method] === 'function') {
        console[method] = function (...args) {
            if (shouldShowLog(args)) originalConsoleMethods[method].apply(console, args);
        };
    }
}

function setupProcessFilter() {
    const originalStdoutWrite = process.stdout.write;
    const originalStderrWrite = process.stderr.write;
    const sessionPatterns = ['closing session','sessionentry','registrationid','currentratchet',
        'indexinfo','pendingprekey','_chains','ephemeralkeypair','lastremoteephemeralkey','rootkey','basekey','reconnect'];
    const filterOutput = (chunk) => {
        const lowerChunk = chunk.toString().toLowerCase();
        return !sessionPatterns.some(p => lowerChunk.includes(p));
    };
    process.stdout.write = function (chunk, encoding, callback) {
        if (filterOutput(chunk)) return originalStdoutWrite.call(this, chunk, encoding, callback);
        if (callback) callback(); return true;
    };
    process.stderr.write = function (chunk, encoding, callback) {
        if (filterOutput(chunk)) return originalStderrWrite.call(this, chunk, encoding, callback);
        if (callback) callback(); return true;
    };
}

process.env.DEBUG = '';
process.env.NODE_ENV = 'production';
process.env.BAILEYS_LOG_LEVEL = 'fatal';
process.env.PINO_LOG_LEVEL = 'fatal';
process.env.BAILEYS_DISABLE_LOG = 'true';
process.env.DISABLE_BAILEYS_LOG = 'true';
process.env.PINO_DISABLE = 'true';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';

dotenv.config({ path: './.env' });

let messageLogCounter = 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSION_DIR = './session';
const BOT_NAME = process.env.BOT_NAME || 'ALICIAH AI';
const VERSION = '2.0.0';
const DEFAULT_PREFIX = process.env.PREFIX || '.';
const OWNER_FILE = './owner.json';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_SETTINGS_FILE = './bot_settings.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';
const BLOCKED_USERS_FILE = './blocked_users.json';
const WELCOME_DATA_FILE = './data/welcome_data.json';
const NEWSLETTERS_FILE = './data/newsletters.json';
const AUTO_CONNECT_ON_LINK = true;
const AUTO_CONNECT_ON_START = true;
const RATE_LIMIT_ENABLED = true;
const MIN_COMMAND_DELAY = 1000;
const STICKER_DELAY = 2000;
const AUTO_JOIN_ENABLED = true;
const AUTO_JOIN_DELAY = 5000;
const SEND_WELCOME_MESSAGE = true;
const GROUP_LINK = 'https://chat.whatsapp.com/G3RopQF1UcSD7AeoVsd6PG';
const GROUP_INVITE_CODE = GROUP_LINK.split('/').pop();
const GROUP_NAME = 'ALICIAH AI Community';
const AUTO_JOIN_LOG_FILE = './auto_join_log.json';

const DEFAULT_NEWSLETTER = '120363419521878542@newsletter';
const AUTO_RESTART = process.env.AUTO_RESTART === 'true';

function silenceBaileysCompletely() {
    try { const pino = require('pino'); pino({ level: 'silent', enabled: false }); } catch {}
}
silenceBaileysCompletely();
console.clear();
setupProcessFilter();

const theme = {
    primary: chalk.cyan,
    secondary: chalk.blue,
    success: chalk.cyan,
    info: chalk.blue,
    warning: chalk.cyan,
    error: chalk.red,
    accent: chalk.cyan.bold
};

class UltraCleanLogger {
    static log(...args) {
        const message = args.join(' ').toLowerCase();
        const suppressPatterns = ['buffer','timeout','transaction','failed to decrypt','received error','sessionerror','bad mac','stream errored','baileys','whatsapp','ws','closing session','sessionentry','_chains','registrationid','currentratchet','indexinfo','pendingprekey','ephemeralkeypair','lastremoteephemeralkey','rootkey','basekey','signal','key','ratchet','encryption','decryption','qr','scan','pairing','connection.update','creds.update','messages.upsert','group','participant','metadata','presence.update','chat.update','message.receipt.update','message.update','keystore','keypair','pubkey','privkey','<buffer','05 ','0x','signalkey','signalprotocol','sessionstate','senderkey','groupcipher','signalgroup', 'reconnect', 'disconnect', 'connection closed'];
        for (const pattern of suppressPatterns) { if (message.includes(pattern)) return; }
        const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
        const cleanArgs = args.map(arg => typeof arg === 'string' ? arg.replace(/\n\s+/g, ' ') : arg);
        originalConsoleMethods.log(timestamp, ...cleanArgs);
    }
    static error(...args) {
        const message = args.join(' ');
        if (message.toLowerCase().includes('fatal') || message.toLowerCase().includes('critical') || message.includes('❌')) {
            const timestamp = chalk.red(`[${new Date().toLocaleTimeString()}]`);
            originalConsoleMethods.error(timestamp, ...args);
        }
    }
    static success(...args) { originalConsoleMethods.log(theme.success(`[${new Date().toLocaleTimeString()}]`), theme.success('✅'), ...args); }
    static info(...args) { originalConsoleMethods.log(theme.info(`[${new Date().toLocaleTimeString()}]`), theme.info('ℹ️'), ...args); }
    static warning(...args) { originalConsoleMethods.log(theme.warning(`[${new Date().toLocaleTimeString()}]`), theme.warning('⚠️'), ...args); }
    static event(...args) { originalConsoleMethods.log(theme.primary(`[${new Date().toLocaleTimeString()}]`), theme.primary('🎭'), ...args); }
    static command(...args) { originalConsoleMethods.log(theme.accent(`[${new Date().toLocaleTimeString()}]`), theme.accent('💬'), ...args); }
    static critical(...args) { originalConsoleMethods.error(chalk.red(`[${new Date().toLocaleTimeString()}]`), chalk.red('🚨'), ...args); }
    static group(...args) { originalConsoleMethods.log(theme.secondary(`[${new Date().toLocaleTimeString()}]`), theme.secondary('👥'), ...args); }
    static member(...args) { originalConsoleMethods.log(theme.primary(`[${new Date().toLocaleTimeString()}]`), theme.primary('👤'), ...args); }
}

console.log = UltraCleanLogger.log;
console.error = UltraCleanLogger.error;
console.info = UltraCleanLogger.info;
console.warn = UltraCleanLogger.warning;
console.debug = () => {};
console.critical = UltraCleanLogger.critical;
global.logSuccess = UltraCleanLogger.success;
global.logInfo = UltraCleanLogger.info;
global.logWarning = UltraCleanLogger.warning;
global.logEvent = UltraCleanLogger.event;
global.logCommand = UltraCleanLogger.command;
global.logGroup = UltraCleanLogger.group;
global.logMember = UltraCleanLogger.member;

const ultraSilentLogger = {
    level: 'silent', trace: () => {}, debug: () => {}, info: () => {}, warn: () => {},
    error: () => {}, fatal: () => {}, child: () => ultraSilentLogger, log: () => {},
    success: () => {}, warning: () => {}, event: () => {}, command: () => {}
};

class RateLimitProtection {
    constructor() {
        this.commandTimestamps = new Map();
        this.userCooldowns = new Map();
        this.globalCooldown = Date.now();
        this.stickerSendTimes = new Map();
        setInterval(() => this.cleanup(), 60000);
    }
    canSendCommand(chatId, userId, command) {
        if (!RATE_LIMIT_ENABLED) return { allowed: true };
        const now = Date.now();
        const userKey = `${userId}_${command}`;
        const chatKey = `${chatId}_${command}`;
        if (this.userCooldowns.has(userKey)) {
            const timeDiff = now - this.userCooldowns.get(userKey);
            if (timeDiff < MIN_COMMAND_DELAY) return { allowed: false, reason: `Please wait ${Math.ceil((MIN_COMMAND_DELAY - timeDiff) / 1000)}s before using ${command} again.` };
        }
        if (this.commandTimestamps.has(chatKey)) {
            const timeDiff = now - this.commandTimestamps.get(chatKey);
            if (timeDiff < MIN_COMMAND_DELAY) return { allowed: false, reason: `Command cooldown: ${Math.ceil((MIN_COMMAND_DELAY - timeDiff) / 1000)}s remaining.` };
        }
        if (now - this.globalCooldown < 250) return { allowed: false, reason: 'System is busy. Please try again in a moment.' };
        this.userCooldowns.set(userKey, now);
        this.commandTimestamps.set(chatKey, now);
        this.globalCooldown = now;
        return { allowed: true };
    }
    async waitForSticker(chatId) {
        if (!RATE_LIMIT_ENABLED) { await this.delay(STICKER_DELAY); return; }
        const now = Date.now();
        const lastSticker = this.stickerSendTimes.get(chatId) || 0;
        const timeDiff = now - lastSticker;
        if (timeDiff < STICKER_DELAY) await this.delay(STICKER_DELAY - timeDiff);
        this.stickerSendTimes.set(chatId, Date.now());
    }
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    cleanup() {
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        for (const [key, timestamp] of this.userCooldowns.entries()) { if (now - timestamp > fiveMinutes) this.userCooldowns.delete(key); }
        for (const [key, timestamp] of this.commandTimestamps.entries()) { if (now - timestamp > fiveMinutes) this.commandTimestamps.delete(key); }
    }
}

const rateLimiter = new RateLimitProtection();

let prefixCache = DEFAULT_PREFIX;
let prefixHistory = [];
let isPrefixless = false;

function getCurrentPrefix() { return isPrefixless ? '' : prefixCache; }

function savePrefixToFile(newPrefix) {
    try {
        const isNone = newPrefix === 'none' || newPrefix === '""' || newPrefix === "''" || newPrefix === '';
        fs.writeFileSync(PREFIX_CONFIG_FILE, JSON.stringify({ prefix: isNone ? '' : newPrefix, isPrefixless: isNone, setAt: new Date().toISOString(), timestamp: Date.now(), version: VERSION, previousPrefix: prefixCache, previousIsPrefixless: isPrefixless }, null, 2));
        fs.writeFileSync(BOT_SETTINGS_FILE, JSON.stringify({ prefix: isNone ? '' : newPrefix, isPrefixless: isNone, prefixSetAt: new Date().toISOString(), prefixChangedAt: Date.now(), previousPrefix: prefixCache, previousIsPrefixless: isPrefixless, version: VERSION }, null, 2));
        return true;
    } catch (error) { UltraCleanLogger.error(`Error saving prefix: ${error.message}`); return false; }
}

function loadPrefixFromFiles() {
    try {
        if (fs.existsSync(PREFIX_CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
            if (config.isPrefixless !== undefined) isPrefixless = config.isPrefixless;
            if (config.prefix !== undefined) {
                if (config.prefix.trim() === '' && config.isPrefixless) return '';
                if (config.prefix.trim() !== '') return config.prefix.trim();
            }
        }
        if (fs.existsSync(BOT_SETTINGS_FILE)) {
            const settings = JSON.parse(fs.readFileSync(BOT_SETTINGS_FILE, 'utf8'));
            if (settings.isPrefixless !== undefined) isPrefixless = settings.isPrefixless;
            if (settings.prefix && settings.prefix.trim() !== '') return settings.prefix.trim();
        }
    } catch (error) { UltraCleanLogger.warning(`Error loading prefix: ${error.message}`); }
    return DEFAULT_PREFIX;
}

function updatePrefixImmediately(newPrefix) {
    const oldPrefix = prefixCache;
    const oldIsPrefixless = isPrefixless;
    const isNone = newPrefix === 'none' || newPrefix === '""' || newPrefix === "''" || newPrefix === '';
    if (isNone) { isPrefixless = true; prefixCache = ''; }
    else {
        if (!newPrefix || newPrefix.trim() === '') return { success: false, error: 'Empty prefix' };
        if (newPrefix.length > 5) return { success: false, error: 'Prefix too long' };
        prefixCache = newPrefix.trim(); isPrefixless = false;
    }
    if (typeof global !== 'undefined') { global.prefix = getCurrentPrefix(); global.CURRENT_PREFIX = getCurrentPrefix(); global.isPrefixless = isPrefixless; }
    process.env.PREFIX = getCurrentPrefix();
    savePrefixToFile(newPrefix);
    prefixHistory.push({ oldPrefix: oldIsPrefixless ? 'none' : oldPrefix, newPrefix: isPrefixless ? 'none' : prefixCache, isPrefixless, oldIsPrefixless, timestamp: new Date().toISOString(), time: Date.now() });
    if (prefixHistory.length > 10) prefixHistory = prefixHistory.slice(-10);
    updateTerminalHeader();
    return { success: true, oldPrefix: oldIsPrefixless ? 'none' : oldPrefix, newPrefix: isPrefixless ? 'none' : prefixCache, isPrefixless, timestamp: new Date().toISOString() };
}

function updateTerminalHeader() {
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
    console.clear();
    console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════════════╗
║   🤖 ${chalk.cyan.bold(`ALICIAH AI v${VERSION}`)} ${chalk.blue('— Powered by CASPER TECH KE')}
║   💬 Prefix  : ${prefixDisplay}
║   🔧 Auto Fix: ✅ ENABLED
║   🛡️ Rate Limit Protection: ✅ ACTIVE
║   🔗 Auto-Connect on Link: ${AUTO_CONNECT_ON_LINK ? '✅' : '❌'}
║   🔐 Login Methods: Pairing Code | Session ID
║   📰 Auto Newsletter: ✅ ACTIVE
║   🔥 Hot Reload: ✅ ACTIVE
╚══════════════════════════════════════════════════════════════════════╝
`));
}

prefixCache = loadPrefixFromFiles();
isPrefixless = prefixCache === '' ? true : false;
updateTerminalHeader();

function detectPlatform() {
    if (process.env.PANEL) return 'Panel';
    if (process.env.HEROKU) return 'Heroku';
    if (process.env.RENDER) return 'Render';
    if (process.env.REPLIT) return 'Replit';
    if (process.env.VERCEL) return 'Vercel';
    return 'Local/VPS';
}

let OWNER_NUMBER = null, OWNER_JID = null, OWNER_CLEAN_JID = null, OWNER_CLEAN_NUMBER = null, OWNER_LID = null;
let XCASPER_INSTANCE = null;
let isConnected = false, store = null;
let heartbeatInterval = null, lastActivityTime = Date.now();
let BOT_MODE = 'public', WHITELIST = new Set(), AUTO_LINK_ENABLED = true;
let AUTO_CONNECT_COMMAND_ENABLED = true, AUTO_ULTIMATE_FIX_ENABLED = true;
let isWaitingForPairingCode = false, RESTART_AUTO_FIX_ENABLED = true;
let hasAutoConnectedOnStart = false;
let followedNewsletters = new Set();
let hotReload = null;

// RECONNECTION TRACKERS - NO MESSAGES
let reconnectAttempts = 0;
let reconnectTimer = null;
let connectionOpenHandled = false;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function loadFollowedNewsletters() {
    try {
        if (fs.existsSync(NEWSLETTERS_FILE)) {
            const data = JSON.parse(fs.readFileSync(NEWSLETTERS_FILE, 'utf8'));
            if (data.newsletters && Array.isArray(data.newsletters)) {
                data.newsletters.forEach(n => followedNewsletters.add(n));
            }
        }
        if (!followedNewsletters.has(DEFAULT_NEWSLETTER)) {
            followedNewsletters.add(DEFAULT_NEWSLETTER);
            saveFollowedNewsletters();
        }
    } catch (error) {
        followedNewsletters.add(DEFAULT_NEWSLETTER);
    }
}

function saveFollowedNewsletters() {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const data = {
            newsletters: Array.from(followedNewsletters),
            updatedAt: new Date().toISOString(),
            total: followedNewsletters.size
        };
        fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {}
}

async function autoFollowNewsletter(xcasper, newsletterJid) {
    try {
        if (!newsletterJid || !newsletterJid.includes('@newsletter')) return false;
        if (followedNewsletters.has(newsletterJid)) return true;
        await xcasper.newsletterFollow(newsletterJid);
        followedNewsletters.add(newsletterJid);
        saveFollowedNewsletters();
        return true;
    } catch (error) {
        return false;
    }
}

async function autoFollowAllNewsletters(xcasper) {
    const newsletters = [DEFAULT_NEWSLETTER];
    if (process.env.EXTRA_NEWSLETTERS) {
        const extra = process.env.EXTRA_NEWSLETTERS.split(',');
        newsletters.push(...extra);
    }
    for (const newsletter of newsletters) {
        await autoFollowNewsletter(xcasper, newsletter);
        await delay(1000);
    }
}

class JidManager {
    constructor() {
        this.ownerJids = new Set();
        this.ownerLids = new Set();
        this.owner = null;
        this.loadOwnerData();
        this.loadWhitelist();
    }
    loadOwnerData() {
        try {
            if (fs.existsSync(OWNER_FILE)) {
                const data = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8'));
                const ownerJid = data.OWNER_JID;
                if (ownerJid) {
                    const cleaned = this.cleanJid(ownerJid);
                    this.owner = { rawJid: ownerJid, cleanJid: cleaned.cleanJid, cleanNumber: cleaned.cleanNumber, isLid: cleaned.isLid, linkedAt: data.linkedAt || new Date().toISOString() };
                    this.ownerJids.clear(); this.ownerLids.clear();
                    this.ownerJids.add(cleaned.cleanJid); this.ownerJids.add(ownerJid);
                    if (cleaned.isLid) { this.ownerLids.add(ownerJid); this.ownerLids.add(ownerJid.split('@')[0]); OWNER_LID = ownerJid; }
                    OWNER_JID = ownerJid; OWNER_NUMBER = cleaned.cleanNumber; OWNER_CLEAN_JID = cleaned.cleanJid; OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                }
            }
        } catch {}
    }
    loadWhitelist() {
        try {
            if (fs.existsSync(WHITELIST_FILE)) {
                const data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
                if (data.whitelist && Array.isArray(data.whitelist)) data.whitelist.forEach(item => WHITELIST.add(item));
            }
        } catch {}
    }
    cleanJid(jid) {
        if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        const isLid = jid.includes('@lid');
        if (isLid) return { raw: jid, cleanJid: jid, cleanNumber: jid.split('@')[0], isLid: true };
        const [numberPart] = jid.split('@')[0].split(':');
        const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        const cleanNumber = numberPart.replace(/[^0-9]/g, '');
        const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
        return { raw: jid, cleanJid: `${normalizedNumber}@${serverPart}`, cleanNumber: normalizedNumber, isLid: false };
    }
    isOwner(msg) {
        if (!msg || !msg.key) return false;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = this.cleanJid(senderJid);
        if (!this.owner || !this.owner.cleanNumber) return false;
        if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) return true;
        if (cleaned.isLid) {
            const lidNumber = cleaned.cleanNumber;
            if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) return true;
            if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) return true;
        }
        return false;
    }
    setNewOwner(newJid, isAutoLinked = false) {
        try {
            const cleaned = this.cleanJid(newJid);
            this.ownerJids.clear(); this.ownerLids.clear(); WHITELIST.clear();
            this.owner = { rawJid: newJid, cleanJid: cleaned.cleanJid, cleanNumber: cleaned.cleanNumber, isLid: cleaned.isLid, linkedAt: new Date().toISOString(), autoLinked: isAutoLinked };
            this.ownerJids.add(cleaned.cleanJid); this.ownerJids.add(newJid);
            if (cleaned.isLid) { this.ownerLids.add(newJid); this.ownerLids.add(newJid.split('@')[0]); OWNER_LID = newJid; } else { OWNER_LID = null; }
            OWNER_JID = newJid; OWNER_NUMBER = cleaned.cleanNumber; OWNER_CLEAN_JID = cleaned.cleanJid; OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            fs.writeFileSync(OWNER_FILE, JSON.stringify({ OWNER_JID: newJid, OWNER_NUMBER: cleaned.cleanNumber, OWNER_CLEAN_JID: cleaned.cleanJid, OWNER_CLEAN_NUMBER: cleaned.cleanNumber, ownerLID: cleaned.isLid ? newJid : null, linkedAt: new Date().toISOString(), autoLinked: isAutoLinked, previousOwnerCleared: true, version: VERSION }, null, 2));
            return { success: true, owner: this.owner, isLid: cleaned.isLid };
        } catch { return { success: false, error: 'Failed to set new owner' }; }
    }
    getOwnerInfo() {
        return { ownerJid: this.owner?.cleanJid || null, ownerNumber: this.owner?.cleanNumber || null, ownerLid: OWNER_LID || null, jidCount: this.ownerJids.size, lidCount: this.ownerLids.size, whitelistCount: WHITELIST.size, isLid: this.owner?.isLid || false, linkedAt: this.owner?.linkedAt || null };
    }
}

const jidManager = new JidManager();

class NewMemberDetector {
    constructor() {
        this.enabled = true;
        this.detectedMembers = new Map();
        this.groupMembersCache = new Map();
        this.loadDetectionData();
    }
    loadDetectionData() {
        try {
            if (fs.existsSync('./data/member_detection.json')) {
                const data = JSON.parse(fs.readFileSync('./data/member_detection.json', 'utf8'));
                if (data.detectedMembers) for (const [g, m] of Object.entries(data.detectedMembers)) this.detectedMembers.set(g, m);
            }
        } catch (error) {}
    }
    saveDetectionData() {
        try {
            const data = { detectedMembers: {}, updatedAt: new Date().toISOString(), totalGroups: this.detectedMembers.size };
            for (const [groupId, members] of this.detectedMembers.entries()) data.detectedMembers[groupId] = members;
            if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
            fs.writeFileSync('./data/member_detection.json', JSON.stringify(data, null, 2));
        } catch (error) {}
    }
    async detectNewMembers(xcasper, groupUpdate) {
        try {
            if (!this.enabled) return null;
            const { id: groupId, action } = groupUpdate;
            if (action === 'add' || action === 'invite') {
                const rawParticipants = groupUpdate.participants || [];
                let cachedMembers = this.groupMembersCache.get(groupId) || new Set();
                const newMembers = [];

                for (const raw of rawParticipants) {
                    const participant = typeof raw === 'string' ? raw : (raw?.id || raw?.jid || String(raw));
                    if (!participant || !participant.includes('@')) continue;

                    if (!cachedMembers.has(participant)) {
                        try {
                            const userInfo = await xcasper.onWhatsApp(participant);
                            const userName = userInfo?.[0]?.name || participant.split('@')[0];
                            const userNumber = participant.split('@')[0];
                            newMembers.push({ jid: participant, name: userName, number: userNumber, addedAt: new Date().toISOString(), timestamp: Date.now(), action, addedBy: groupUpdate.actor || 'unknown' });
                            cachedMembers.add(participant);
                        } catch (error) {}
                    }
                }

                this.groupMembersCache.set(groupId, cachedMembers);
                if (newMembers.length > 0) {
                    const groupEvents = this.detectedMembers.get(groupId) || [];
                    groupEvents.push(...newMembers);
                    this.detectedMembers.set(groupId, groupEvents.slice(-50));
                    if (Math.random() < 0.2) this.saveDetectionData();
                    return newMembers;
                }
            }
            return null;
        } catch (error) { return null; }
    }
    getStats() {
        let totalEvents = 0;
        for (const events of this.detectedMembers.values()) totalEvents += events.length;
        return { enabled: this.enabled, totalGroups: this.detectedMembers.size, totalEvents, cachedGroups: this.groupMembersCache.size };
    }
}

const memberDetector = new NewMemberDetector();

class AutoGroupJoinSystem {
    constructor() {
        this.invitedUsers = new Set();
        this.loadInvitedUsers();
    }
    loadInvitedUsers() {
        try {
            if (fs.existsSync(AUTO_JOIN_LOG_FILE)) {
                const data = JSON.parse(fs.readFileSync(AUTO_JOIN_LOG_FILE, 'utf8'));
                data.users.forEach(user => this.invitedUsers.add(user));
            }
        } catch {}
    }
    saveInvitedUser(userJid) {
        try {
            this.invitedUsers.add(userJid);
            let data = { users: [], lastUpdated: new Date().toISOString(), totalInvites: 0 };
            if (fs.existsSync(AUTO_JOIN_LOG_FILE)) data = JSON.parse(fs.readFileSync(AUTO_JOIN_LOG_FILE, 'utf8'));
            if (!data.users.includes(userJid)) { data.users.push(userJid); data.totalInvites = data.users.length; data.lastUpdated = new Date().toISOString(); fs.writeFileSync(AUTO_JOIN_LOG_FILE, JSON.stringify(data, null, 2)); }
        } catch (error) {}
    }
    isOwner(userJid, jidManager) {
        if (!jidManager.owner || !jidManager.owner.cleanNumber) return false;
        return userJid === jidManager.owner.cleanJid || userJid === jidManager.owner.rawJid || userJid.includes(jidManager.owner.cleanNumber);
    }
    async sendWelcomeMessage(xcasper, userJid) {
        if (!SEND_WELCOME_MESSAGE) return;
        try { await xcasper.sendMessage(userJid, { text: `🎉 *WELCOME TO ALICIAH AI!*\n\nThank you for connecting! 🤖\nYou're being automatically invited to our community group...\nPlease wait... ⏳` }); } catch (error) {}
    }
    async sendGroupInvitation(xcasper, userJid, isOwner = false) {
        try {
            await xcasper.sendMessage(userJid, { text: isOwner ? `👑 *OWNER AUTO-JOIN*\n\nYou are being automatically added to the group...\n🔗 ${GROUP_LINK}` : `🔗 *GROUP INVITATION*\n\nJoin our community: ${GROUP_LINK}\n*Group Name:* ${GROUP_NAME}` });
            return true;
        } catch (error) { return false; }
    }
    async attemptAutoAdd(xcasper, userJid, isOwner = false) {
        try {
            let groupId;
            try { groupId = await xcasper.groupAcceptInvite(GROUP_INVITE_CODE); } catch (inviteError) { throw new Error('Could not access group with invite code'); }
            await xcasper.groupParticipantsUpdate(groupId, [userJid], 'add');
            await xcasper.sendMessage(userJid, { text: `✅ *SUCCESSFULLY JOINED!*\n\nYou have been added to the group! 🎉` });
            return true;
        } catch (error) {
            await xcasper.sendMessage(userJid, { text: `⚠️ *MANUAL JOIN REQUIRED*\n\nPlease join manually:\n${GROUP_LINK}` });
            return false;
        }
    }
    async autoJoinGroup(xcasper, userJid) {
        if (!AUTO_JOIN_ENABLED) return false;
        if (this.invitedUsers.has(userJid)) return false;
        const isOwner = this.isOwner(userJid, jidManager);
        await this.sendWelcomeMessage(xcasper, userJid);
        await new Promise(resolve => setTimeout(resolve, AUTO_JOIN_DELAY));
        await this.sendGroupInvitation(xcasper, userJid, isOwner);
        await new Promise(resolve => setTimeout(resolve, 3000));
        const success = await this.attemptAutoAdd(xcasper, userJid, isOwner);
        this.saveInvitedUser(userJid);
        return success;
    }
}

const autoGroupJoinSystem = new AutoGroupJoinSystem();

class UltimateFixSystem {
    constructor() { this.fixedJids = new Set(); this.fixApplied = false; this.restartFixAttempted = false; }
    async applyUltimateFix(xcasper, senderJid, cleaned, isFirstUser = false, isRestart = false) {
        try {
            const originalIsOwner = jidManager.isOwner;
            jidManager.isOwner = function (message) {
                try {
                    if (message?.key?.fromMe) return true;
                    if (!this.owner || !this.owner.cleanNumber) this.loadOwnerDataFromFile?.();
                    return originalIsOwner.call(this, message);
                } catch { return message?.key?.fromMe || false; }
            };
            jidManager.loadOwnerDataFromFile = function () {
                try {
                    if (fs.existsSync('./owner.json')) {
                        const data = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                        let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
                        if (cleanNumber && cleanNumber.includes(':')) cleanNumber = cleanNumber.split(':')[0];
                        this.owner = { cleanNumber, cleanJid: data.OWNER_CLEAN_JID || data.OWNER_JID, rawJid: data.OWNER_JID, isLid: (data.OWNER_CLEAN_JID || data.OWNER_JID)?.includes('@lid') || false };
                        return true;
                    }
                } catch {}
                return false;
            };
            global.OWNER_NUMBER = cleaned.cleanNumber; global.OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            global.OWNER_JID = cleaned.cleanJid; global.OWNER_CLEAN_JID = cleaned.cleanJid;
            this.fixedJids.add(senderJid); this.fixApplied = true;
            return { success: true, jid: cleaned.cleanJid, number: cleaned.cleanNumber, isLid: cleaned.isLid, isRestart };
        } catch (error) { return { success: false, error: 'Fix failed' }; }
    }
    isFixNeeded(jid) { return !this.fixedJids.has(jid); }
    shouldRunRestartFix(ownerJid) { return fs.existsSync(OWNER_FILE) && this.isFixNeeded(ownerJid) && !this.restartFixAttempted && RESTART_AUTO_FIX_ENABLED; }
    markRestartFixAttempted() { this.restartFixAttempted = true; }
}

const ultimateFixSystem = new UltimateFixSystem();

class AutoConnectOnStart {
    constructor() { this.hasRun = false; this.isEnabled = AUTO_CONNECT_ON_START; }
    async trigger(xcasper) {
        try {
            if (!this.isEnabled || this.hasRun) return;
            if (!xcasper || !xcasper.user?.id) return;
            const ownerJid = xcasper.user.id;
            const cleaned = jidManager.cleanJid(ownerJid);
            const mockMsg = { key: { remoteJid: ownerJid, fromMe: true, id: 'auto-start-' + Date.now(), participant: ownerJid }, message: { conversation: '.connect' } };
            await delay(2000);
            await handleConnectCommand(xcasper, mockMsg, [], cleaned);
            this.hasRun = true; hasAutoConnectedOnStart = true;
        } catch (error) {}
    }
    reset() { this.hasRun = false; hasAutoConnectedOnStart = false; }
}

const autoConnectOnStart = new AutoConnectOnStart();

class AutoLinkSystem {
    constructor() { this.linkAttempts = new Map(); this.MAX_ATTEMPTS = 3; this.autoConnectEnabled = AUTO_CONNECT_ON_LINK; }
    async shouldAutoLink(xcasper, msg) {
        if (!AUTO_LINK_ENABLED) return false;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = jidManager.cleanJid(senderJid);
        if (!jidManager.owner || !jidManager.owner.cleanNumber) {
            const result = await this.autoLinkNewOwner(xcasper, senderJid, cleaned, true);
            if (result && this.autoConnectEnabled) setTimeout(async () => { await this.triggerAutoConnect(xcasper, msg, cleaned, true); }, 1500);
            return result;
        }
        if (msg.key.fromMe) return false;
        if (jidManager.isOwner(msg)) return false;
        const currentOwnerNumber = jidManager.owner.cleanNumber;
        if (this.isSimilarNumber(cleaned.cleanNumber, currentOwnerNumber)) {
            if (!jidManager.ownerJids.has(cleaned.cleanJid)) {
                jidManager.ownerJids.add(cleaned.cleanJid); jidManager.ownerJids.add(senderJid);
                if (AUTO_ULTIMATE_FIX_ENABLED && ultimateFixSystem.isFixNeeded(senderJid)) setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(xcasper, senderJid, cleaned, false); }, 800);
                await this.sendDeviceLinkedMessage(xcasper, senderJid, cleaned);
                if (this.autoConnectEnabled) setTimeout(async () => { await this.triggerAutoConnect(xcasper, msg, cleaned, false); }, 1500);
                return true;
            }
        }
        return false;
    }
    isSimilarNumber(num1, num2) {
        if (!num1 || !num2) return false;
        if (num1 === num2) return true;
        if (num1.includes(num2) || num2.includes(num1)) return true;
        if (num1.length >= 6 && num2.length >= 6) return num1.slice(-6) === num2.slice(-6);
        return false;
    }
    async autoLinkNewOwner(xcasper, senderJid, cleaned, isFirstUser = false) {
        try {
            const result = jidManager.setNewOwner(senderJid, true);
            if (!result.success) return false;
            await this.sendImmediateSuccessMessage(xcasper, senderJid, cleaned, isFirstUser);
            if (AUTO_ULTIMATE_FIX_ENABLED) setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(xcasper, senderJid, cleaned, isFirstUser); }, 1200);
            if (AUTO_JOIN_ENABLED) setTimeout(async () => { try { await autoGroupJoinSystem.autoJoinGroup(xcasper, senderJid); } catch (error) {} }, 3000);
            return true;
        } catch { return false; }
    }
    async triggerAutoConnect(xcasper, msg, cleaned, isNewOwner = false) {
        try { if (!this.autoConnectEnabled) return; await handleConnectCommand(xcasper, msg, [], cleaned); } catch (error) {}
    }
    async sendImmediateSuccessMessage(xcasper, senderJid, cleaned, isFirstUser = false) {
        try {
            const currentPrefix = getCurrentPrefix();
            const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
            await xcasper.sendMessage(senderJid, { text: `✅ *ALICIAH AI v${VERSION} CONNECTED!*\n\n${isFirstUser ? '🎉 *FIRST TIME SETUP COMPLETE!*\n\n' : '🔄 *NEW OWNER LINKED!*\n\n'}📋 *YOUR INFORMATION:*\n├─ Your Number: +${cleaned.cleanNumber}\n├─ Device Type: ${cleaned.isLid ? 'Linked Device 🔗' : 'Regular Device 📱'}\n├─ Prefix: ${prefixDisplay}\n└─ Status: ✅ LINKED SUCCESSFULLY\n\n🎉 *You're all set!*` });
        } catch {}
    }
    async sendDeviceLinkedMessage(xcasper, senderJid, cleaned) {
        try { await xcasper.sendMessage(senderJid, { text: `📱 *Device Linked Successfully!*\n\n✅ You can now use owner commands from this device.\n🎉 All systems are now active!` }); } catch {}
    }
}

const autoLinkSystem = new AutoLinkSystem();

async function handleConnectCommand(xcasper, msg, args, cleaned) {
    try {
        const chatJid = msg.key.remoteJid || cleaned.cleanJid;
        const start = Date.now();
        const currentPrefix = getCurrentPrefix();
        const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
        const platform = detectPlatform();
        const loadingMessage = await xcasper.sendMessage(chatJid, { text: `🤖 *ALICIAH AI* is checking connection... █▒▒▒▒▒▒▒▒▒` }, { quoted: msg });
        const latency = Date.now() - start;
        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
        const isOwnerUser = jidManager.isOwner(msg);
        const memberStats = memberDetector ? memberDetector.getStats() : null;
        let statusEmoji, statusText, mood;
        if (latency <= 100) { statusEmoji = '🟢'; statusText = 'Excellent'; mood = '⚡Superb Connection'; }
        else if (latency <= 300) { statusEmoji = '🟡'; statusText = 'Good'; mood = '📡Stable Link'; }
        else { statusEmoji = '🔴'; statusText = 'Slow'; mood = '🌑Needs Optimization'; }
        await delay(Math.max(500, 1000 - (Date.now() - start)));
        await xcasper.sendMessage(chatJid, { text: `\n╭━━🤖 *ALICIAH AI STATUS* 🤖━━╮\n┃  ⚡ *User:* ${cleaned.cleanNumber}\n┃  🔴 *Prefix:* ${prefixDisplay}\n┃  🐾 *Ultimatefix:* ${isOwnerUser ? '✅' : '❌'}\n┃  🏗️ *Platform:* ${platform}\n┃  ⏱️ *Latency:* ${latency}ms ${statusEmoji}\n┃  ⏰ *Uptime:* ${h}h ${m}m ${s}s\n┃  👥 *Members:* ${memberStats ? memberStats.totalEvents + ' events' : 'Not loaded'}\n┃  🔗 *Status:* ${statusText}\n┃  🎯 *Mood:* ${mood}\n┃  👑 *Owner:* ${isOwnerUser ? '✅ Yes' : '❌ No'}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n_🤖 ALICIAH AI — Powered by CASPER TECH KE_\n`, edit: loadingMessage.key }, { quoted: msg });
        return true;
    } catch { return false; }
}

class StatusDetector {
    constructor() {
        this.detectionEnabled = true; this.statusLogs = []; this.lastDetection = null;
        this.setupDataDir(); this.loadStatusLogs();
    }
    setupDataDir() { try { if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true }); } catch (error) {} }
    loadStatusLogs() {
        try {
            if (fs.existsSync('./data/status_detection_logs.json')) {
                const data = JSON.parse(fs.readFileSync('./data/status_detection_logs.json', 'utf8'));
                if (Array.isArray(data.logs)) this.statusLogs = data.logs.slice(-100);
            }
        } catch {}
    }
    saveStatusLogs() {
        try { fs.writeFileSync('./data/status_detection_logs.json', JSON.stringify({ logs: this.statusLogs.slice(-1000), updatedAt: new Date().toISOString(), count: this.statusLogs.length }, null, 2)); } catch {}
    }
    async detectStatusUpdate(msg) {
        try {
            if (!this.detectionEnabled) return null;
            const sender = msg.key.participant || 'unknown';
            const shortSender = sender.split('@')[0];
            const timestamp = msg.messageTimestamp || Date.now();
            const statusTime = new Date(timestamp * 1000).toLocaleTimeString();
            const statusInfo = this.extractStatusInfo(msg);
            const logEntry = { sender: shortSender, fullSender: sender, type: statusInfo.type, caption: statusInfo.caption, fileInfo: statusInfo.fileInfo, postedAt: statusTime, detectedAt: new Date().toLocaleTimeString(), timestamp: Date.now() };
            this.statusLogs.push(logEntry); this.lastDetection = logEntry;
            if (this.statusLogs.length % 5 === 0) this.saveStatusLogs();
            return logEntry;
        } catch { return null; }
    }
    extractStatusInfo(msg) {
        try {
            const message = msg.message;
            let type = 'unknown', caption = '', fileInfo = '';
            if (message.imageMessage) { type = 'image'; caption = message.imageMessage.caption || ''; }
            else if (message.videoMessage) { type = 'video'; caption = message.videoMessage.caption || ''; }
            else if (message.audioMessage) { type = 'audio'; }
            else if (message.extendedTextMessage) { type = 'text'; caption = message.extendedTextMessage.text || ''; }
            else if (message.conversation) { type = 'text'; caption = message.conversation; }
            else if (message.stickerMessage) { type = 'sticker'; }
            return { type, caption: caption.substring(0, 100), fileInfo };
        } catch { return { type: 'unknown', caption: '', fileInfo: '' }; }
    }
    getStats() {
        return { totalDetected: this.statusLogs.length, lastDetection: this.lastDetection ? `${this.lastDetection.sender} - ${this.getTimeAgo(this.lastDetection.timestamp)}` : 'None', detectionEnabled: this.detectionEnabled };
    }
    getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now'; if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`;
    }
}

let statusDetector = null;

function isUserBlocked(jid) {
    try { if (fs.existsSync(BLOCKED_USERS_FILE)) { const data = JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, 'utf8')); return data.users && data.users.includes(jid); } } catch {}
    return false;
}

function checkBotMode(msg, commandName) {
    try {
        if (jidManager.isOwner(msg)) return true;
        if (fs.existsSync(BOT_MODE_FILE)) { const modeData = JSON.parse(fs.readFileSync(BOT_MODE_FILE, 'utf8')); BOT_MODE = modeData.mode || 'public'; } else { BOT_MODE = 'public'; }
        const chatJid = msg.key.remoteJid;
        switch (BOT_MODE) {
            case 'public': return true; case 'private': return false; case 'silent': return false;
            case 'group-only': return chatJid.includes('@g.us');
            case 'maintenance': return ['ping', 'status', 'uptime', 'help'].includes(commandName);
            default: return true;
        }
    } catch { return true; }
}

async function checkCommandPermissions(xcasper, msg, command, isOwnerUser, chatId, senderJid) {
    const isGroup = chatId.includes('@g.us');
    
    if (command.ownerOnly && !isOwnerUser) {
        await xcasper.sendMessage(chatId, { text: '❌ *Owner Only Command*\n\nThis command can only be used by the bot owner.' }, { quoted: msg });
        return false;
    }
    
    if (command.groupOnly && !isGroup) {
        await xcasper.sendMessage(chatId, { text: '❌ *Group Only Command*\n\nThis command can only be used in groups.' }, { quoted: msg });
        return false;
    }
    
    if (command.adminOnly && isGroup) {
        let isAdmin = false;
        try {
            const groupMetadata = await xcasper.groupMetadata(chatId);
            const participant = groupMetadata.participants.find(p => p.id === senderJid);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || isOwnerUser;
        } catch (error) {
            isAdmin = isOwnerUser;
        }
        
        if (!isAdmin) {
            await xcasper.sendMessage(chatId, { text: '❌ *Admin Only Command*\n\nThis command requires admin privileges in this group.' }, { quoted: msg });
            return false;
        }
    }
    
    if (command.whitelistOnly && !WHITELIST.has(senderJid) && !isOwnerUser) {
        await xcasper.sendMessage(chatId, { text: '❌ *Whitelist Only Command*\n\nYou are not whitelisted to use this command.' }, { quoted: msg });
        return false;
    }
    
    return true;
}

function startHeartbeat(xcasper) {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(async () => { if (isConnected && xcasper) { try { await xcasper.sendPresenceUpdate('available'); lastActivityTime = Date.now(); } catch {} } }, 60 * 1000);
}

function stopHeartbeat() { if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; } }

function ensureSessionDir() { if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true }); }

function cleanSession() { try { if (fs.existsSync(SESSION_DIR)) fs.rmSync(SESSION_DIR, { recursive: true, force: true }); return true; } catch { return false; } }

class MessageStore {
    constructor() { this.messages = new Map(); this.maxMessages = 100; }
    addMessage(jid, messageId, message) {
        try {
            const key = `${jid}|${messageId}`;
            this.messages.set(key, { ...message, timestamp: Date.now() });
            if (this.messages.size > this.maxMessages) this.messages.delete(this.messages.keys().next().value);
        } catch {}
    }
    getMessage(jid, messageId) { try { return this.messages.get(`${jid}|${messageId}`) || null; } catch { return null; } }
}

const commands = new Map();
const commandCategories = new Map();

async function loadCommandsFromFolder(folderPath, category = 'general') {
    const absolutePath = path.resolve(folderPath);
    if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
        return;
    }
    
    try {
        const items = fs.readdirSync(absolutePath);
        
        for (const item of items) {
            const fullPath = path.join(absolutePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                await loadCommandsFromFolder(fullPath, item);
            } else if (item.endsWith('.js')) {
                try {
                    if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
                    const commandModule = await import(`file://${fullPath}?update=${Date.now()}`);
                    const command = commandModule.default || commandModule;
                    
                    if (command && command.name) {
                        command.category = command.category || category;
                        command.ownerOnly = command.ownerOnly || false;
                        command.groupOnly = command.groupOnly || false;
                        command.adminOnly = command.adminOnly || false;
                        command.whitelistOnly = command.whitelistOnly || false;
                        
                        commands.set(command.name.toLowerCase(), command);
                        
                        if (!commandCategories.has(command.category)) {
                            commandCategories.set(command.category, []);
                        }
                        if (!commandCategories.get(command.category).includes(command.name)) {
                            commandCategories.get(command.category).push(command.name);
                        }
                        
                        if (Array.isArray(command.alias)) {
                            command.alias.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                            });
                        }
                    }
                } catch (error) {}
            }
        }
    } catch (error) {}
}

function parseALICIAHSession(sessionString) {
    try {
        let cleaned = sessionString.trim().replace(/^["']|["']$/g, '');
        if (cleaned.startsWith('ALICIAH-AI:') || cleaned.startsWith('CASPER:')) {
            const base64Part = cleaned.substring(cleaned.indexOf(':') + 1).trim();
            if (!base64Part) throw new Error('No data after prefix');
            try { return JSON.parse(Buffer.from(base64Part, 'base64').toString('utf8')); } catch { return JSON.parse(base64Part); }
        }
        try { return JSON.parse(Buffer.from(cleaned, 'base64').toString('utf8')); } catch { return JSON.parse(cleaned); }
    } catch (error) { return null; }
}

async function authenticateWithSessionId(sessionId) {
    try {
        const sessionData = parseALICIAHSession(sessionId);
        if (!sessionData) throw new Error('Could not parse session data');
        if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
        fs.writeFileSync(path.join(SESSION_DIR, 'creds.json'), JSON.stringify(sessionData, null, 2));
        return true;
    } catch (error) { throw error; }
}

class LoginManager {
    constructor() { this.rl = readline.createInterface({ input: process.stdin, output: process.stdout }); }
    
    async selectMode() {
        const sessionExists = fs.existsSync(SESSION_DIR);
        const credsExists = fs.existsSync(path.join(SESSION_DIR, 'creds.json'));
        const hasValidSession = sessionExists && credsExists;
        
        if (AUTO_RESTART || hasValidSession) {
            if (hasValidSession) {
                console.log(chalk.green('\n✅ Existing session detected! Auto-connecting...'));
            }
            return { mode: 'auto', phone: null };
        }
        
        console.log(chalk.yellow('\n⚠️ No session found. Please login:'));
        console.log(chalk.cyan('\n🤖 ALICIAH AI v' + VERSION + ' - LOGIN SYSTEM'));
        console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
        console.log(chalk.blue('2) Clean Session & Start Fresh'));
        console.log(chalk.magenta('3) Use Session ID from Environment'));
        const choice = await this.ask('Choose option (1-3, default 1): ');
        switch (choice.trim()) {
            case '1': return await this.pairingCodeMode();
            case '2': return await this.cleanStartMode();
            case '3': return await this.sessionIdMode();
            default: return await this.pairingCodeMode();
        }
    }
    
    async sessionIdMode() {
        let sessionId = process.env.SESSION_ID;
        if (!sessionId || sessionId.trim() === '') {
            const input = await this.ask('\nWould you like to:\n1) Paste Session ID now\n2) Go back to main menu\nChoice (1-2): ');
            if (input.trim() === '1') { 
                sessionId = await this.ask('Paste your Session ID (ALICIAH-AI:... or CASPER:... or base64): '); 
                if (!sessionId || sessionId.trim() === '') return await this.selectMode(); 
            } else return await this.selectMode();
        }
        try { 
            await authenticateWithSessionId(sessionId); 
            console.log(chalk.green('✅ Session restored! Restarting...'));
            return { mode: 'auto', phone: null };
        } catch { 
            console.log(chalk.yellow('📝 Invalid session, falling back to pairing code mode...')); 
            return await this.pairingCodeMode(); 
        }
    }
    
    async pairingCodeMode() {
        console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
        const phone = await this.ask('Phone number (with country code, no +): ');
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!cleanPhone || cleanPhone.length < 10) { 
            console.log(chalk.red('❌ Invalid phone number')); 
            return await this.selectMode(); 
        }
        return { mode: 'pair', phone: cleanPhone };
    }
    
    async cleanStartMode() {
        const confirm = await this.ask('This will delete all session data. Are you sure? (y/n): ');
        if (confirm.toLowerCase() === 'y') { 
            cleanSession(); 
            console.log(chalk.green('✅ Session cleared! Proceeding to pairing...'));
            return await this.pairingCodeMode(); 
        }
        return await this.selectMode();
    }
    
    ask(question) { 
        return new Promise((resolve) => { 
            this.rl.question(chalk.cyan(question), resolve); 
        }); 
    }
    
    close() { 
        if (this.rl) this.rl.close(); 
    }
}

class HotReloadSystem {
    constructor() {
        this.watchers = new Map();
        this.commandsMap = null;
        this.commandCategoriesMap = null;
        this.reloadCallback = null;
        this.isWatching = false;
        this.pendingReloads = new Map();
        this.reloadDebounceTime = 500;
    }

    initialize(commandsMap, commandCategoriesMap, onReloadComplete) {
        this.commandsMap = commandsMap;
        this.commandCategoriesMap = commandCategoriesMap;
        this.reloadCallback = onReloadComplete;
        this.startWatching();
    }

    startWatching() {
        if (this.isWatching) return;
        const commandsPath = path.resolve('./commands');
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
        }
        this.watchDirectory(commandsPath);
        this.isWatching = true;
    }

    watchDirectory(directory) {
        try {
            const watcher = fs.watch(directory, { recursive: true }, (eventType, filename) => {
                if (!filename) return;
                if (!filename.endsWith('.js')) return;
                const fullPath = path.join(directory, filename);
                if (this.pendingReloads.has(fullPath)) {
                    clearTimeout(this.pendingReloads.get(fullPath));
                }
                this.pendingReloads.set(fullPath, setTimeout(() => {
                    this.pendingReloads.delete(fullPath);
                    this.handleFileChange(fullPath);
                }, this.reloadDebounceTime));
            });
            this.watchers.set(directory, watcher);
            const items = fs.readdirSync(directory);
            for (const item of items) {
                const fullPath = path.join(directory, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    this.watchDirectory(fullPath);
                }
            }
        } catch (error) {}
    }

    async handleFileChange(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                await this.reloadCommands();
                return;
            }
            const fileName = path.basename(filePath);
            if (!fileName.endsWith('.js') || fileName.includes('.test.') || fileName.includes('.disabled.')) {
                return;
            }
            await this.reloadCommands();
        } catch (error) {}
    }

    async reloadCommands() {
        try {
            const startTime = Date.now(); // FIXED: Added this line
            const oldCommandCount = this.commandsMap.size;
            const oldCategories = new Map(this.commandCategoriesMap);
            this.commandsMap.clear();
            this.commandCategoriesMap.clear();
            await this.loadCommandsFromFolder('./commands');
            const newCommandCount = this.commandsMap.size;
            const reloadTime = Date.now() - startTime;
            if (this.reloadCallback) {
                await this.reloadCallback({
                    oldCount: oldCommandCount,
                    newCount: newCommandCount,
                    reloadTime: reloadTime,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {}
    }

    async loadCommandsFromFolder(folderPath, category = 'general') {
        const absolutePath = path.resolve(folderPath);
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true });
            return;
        }
        try {
            const items = fs.readdirSync(absolutePath);
            for (const item of items) {
                const fullPath = path.join(absolutePath, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    await this.loadCommandsFromFolder(fullPath, item);
                } else if (item.endsWith('.js')) {
                    try {
                        if (item.includes('.test.') || item.includes('.disabled.')) continue;
                        const commandModule = await import(`file://${fullPath}?update=${Date.now()}`);
                        const command = commandModule.default || commandModule;
                        if (command && command.name) {
                            command.category = command.category || category;
                            command.ownerOnly = command.ownerOnly || false;
                            command.groupOnly = command.groupOnly || false;
                            command.adminOnly = command.adminOnly || false;
                            command.whitelistOnly = command.whitelistOnly || false;
                            this.commandsMap.set(command.name.toLowerCase(), command);
                            if (!this.commandCategoriesMap.has(command.category)) {
                                this.commandCategoriesMap.set(command.category, []);
                            }
                            if (!this.commandCategoriesMap.get(command.category).includes(command.name)) {
                                this.commandCategoriesMap.get(command.category).push(command.name);
                            }
                            if (Array.isArray(command.alias)) {
                                command.alias.forEach(alias => {
                                    this.commandsMap.set(alias.toLowerCase(), command);
                                });
                            }
                        }
                    } catch (error) {}
                }
            }
        } catch (error) {}
    }

    stopWatching() {
        for (const [dir, watcher] of this.watchers) {
            try {
                watcher.close();
            } catch (error) {}
        }
        this.watchers.clear();
        this.isWatching = false;
    }

    getStatus() {
        return {
            isWatching: this.isWatching,
            watchedDirectories: this.watchers.size,
            pendingReloads: this.pendingReloads.size,
            commandCount: this.commandsMap?.size || 0,
            categoryCount: this.commandCategoriesMap?.size || 0
        };
    }
}

// SILENT CONNECTION HANDLER - NO RECONNECT MESSAGES
async function handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber) {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (isConnected) return;
    
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    
    if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
        cleanSession();
        reconnectAttempts = 0;
        reconnectTimer = setTimeout(() => {
            startBot('auto', null);
        }, 5000);
        return;
    }
    
    if (reconnectAttempts >= 5) {
        reconnectAttempts = 0;
        process.exit(0);
        return;
    }
    
    reconnectAttempts++;
    let delay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 60000);
    
    reconnectTimer = setTimeout(() => {
        startBot(loginMode, phoneNumber);
    }, delay);
}

async function handleSuccessfulConnection(xcasper, loginMode, loginData) {
    OWNER_JID = xcasper.user.id;
    OWNER_NUMBER = OWNER_JID.split('@')[0];
    const isFirstConnection = !fs.existsSync(OWNER_FILE);
    if (isFirstConnection) jidManager.setNewOwner(OWNER_JID, false); else jidManager.loadOwnerData();
    const ownerInfo = jidManager.getOwnerInfo();
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
    updateTerminalHeader();
    
    // Only ONE connection message - no spam
    console.log(chalk.green(`\n✅ ALICIAH AI Connected | Owner: +${ownerInfo.ownerNumber}\n`));
    
    const cleaned = jidManager.cleanJid(OWNER_JID);
    if (ultimateFixSystem.isFixNeeded(OWNER_JID)) {
        setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(xcasper, OWNER_JID, cleaned, isFirstConnection); }, 1200);
    }
}

async function startBot(loginMode = 'pair', loginData = null) {
    try {
        if (loginMode === 'session' && loginData) {
            try { 
                await authenticateWithSessionId(loginData); 
                loginMode = 'auto';
            } catch { 
                const lm = new LoginManager(); 
                const nm = await lm.pairingCodeMode(); 
                lm.close(); 
                loginMode = nm.mode; 
                loginData = nm.phone; 
            }
        }
        
        commands.clear();
        commandCategories.clear();
        await loadCommandsFromFolder('./commands');
        
        hotReload = new HotReloadSystem();
        hotReload.initialize(commands, commandCategories, async (reloadInfo) => {});
        
        store = new MessageStore();
        ensureSessionDir();
        statusDetector = new StatusDetector();
        autoConnectOnStart.reset();
        loadFollowedNewsletters();
        
        const { default: makeWASocket } = await import('@whiskeysockets/baileys');
        const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
        let state, saveCreds;
        try { 
            const authState = await useMultiFileAuthState(SESSION_DIR); 
            state = authState.state; 
            saveCreds = authState.saveCreds; 
        } catch { 
            cleanSession(); 
            const freshAuth = await useMultiFileAuthState(SESSION_DIR); 
            state = freshAuth.state; 
            saveCreds = freshAuth.saveCreds; 
        }
        
        const { version } = await fetchLatestBaileysVersion();
        
        const xcasper = makeWASocket({ 
            version, 
            logger: ultraSilentLogger, 
            browser: Browsers.ubuntu('Chrome'), 
            printQRInTerminal: false, 
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, ultraSilentLogger) 
            }, 
            markOnlineOnConnect: true, 
            generateHighQualityLinkPreview: true, 
            connectTimeoutMs: 60000, 
            keepAliveIntervalMs: 30000, 
            emitOwnEvents: true, 
            mobile: false, 
            getMessage: async (key) => store?.getMessage(key.remoteJid, key.id) || null, 
            defaultQueryTimeoutMs: 30000 
        });
        
        XCASPER_INSTANCE = xcasper;
        reconnectAttempts = 0;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        isWaitingForPairingCode = false;

        // SILENT CONNECTION UPDATE HANDLER
        xcasper.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open' && !connectionOpenHandled) {
                connectionOpenHandled = true;
                reconnectAttempts = 0;
                isConnected = true;
                startHeartbeat(xcasper);
                await handleSuccessfulConnection(xcasper, loginMode, loginData);
                isWaitingForPairingCode = false;
                
                setTimeout(async () => {
                    await autoFollowAllNewsletters(xcasper);
                }, 5000);
                
                if (AUTO_CONNECT_ON_START) setTimeout(async () => { await autoConnectOnStart.trigger(xcasper); }, 2000);
                
                setTimeout(() => { connectionOpenHandled = false; }, 10000);
            }
            
            if (connection === 'close') {
                isConnected = false;
                stopHeartbeat();
                if (statusDetector) statusDetector.saveStatusLogs();
                if (memberDetector) memberDetector.saveDetectionData();
                await handleConnectionCloseSilently(lastDisconnect, loginMode, loginData);
                isWaitingForPairingCode = false;
            }
        });

        if (loginMode === 'pair' && loginData) {
            setTimeout(async () => {
                if (!state.creds.registered && !isWaitingForPairingCode) {
                    isWaitingForPairingCode = true;
                    try {
                        const code = await xcasper.requestPairingCode(loginData);
                        const cleanCode = code.replace(/\s+/g, '');
                        const formattedCode = cleanCode.length === 8 ? `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}` : cleanCode;
                        console.clear();
                        console.log(chalk.greenBright(`\n╔══════════════════════════════════════════╗\n║         🔗 PAIRING CODE - ALICIAH AI        \n╠══════════════════════════════════════════╣\n║ 📞 Phone  : ${chalk.cyan(loginData)}\n║ 🔑 Code   : ${chalk.yellow.bold(formattedCode)}\n║ ⏰ Expires : 10 minutes\n╚══════════════════════════════════════════╝\n`));
                        console.log(chalk.cyan('📱 INSTRUCTIONS:'));
                        console.log(chalk.white('1. Open WhatsApp → Settings → Linked Devices'));
                        console.log(chalk.white('2. Tap "Link a Device"'));
                        console.log(chalk.yellow.bold(`3. Enter code: ${formattedCode}\n`));
                    } catch (error) {
                        isWaitingForPairingCode = false;
                    }
                }
            }, 2000);
        }

        xcasper.ev.on('creds.update', saveCreds);
        xcasper.ev.on('group-participants.update', async (update) => {
            try { 
                if (memberDetector && memberDetector.enabled) { 
                    await memberDetector.detectNewMembers(xcasper, update); 
                } 
            } catch (error) {}
        });
        
        xcasper.ev.on('newsletter.update', async (update) => {
            if (update.id && !followedNewsletters.has(update.id)) {
                await autoFollowNewsletter(xcasper, update.id);
            }
        });
        
        xcasper.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message) return;
            lastActivityTime = Date.now();
            
            if (msg.key?.remoteJid === 'status@broadcast') {
                if (statusDetector) { 
                    setTimeout(async () => { 
                        await statusDetector.detectStatusUpdate(msg);
                    }, 800); 
                }
                return;
            }
            
            if (msg.key?.remoteJid?.includes('@newsletter')) {
                const newsletterJid = msg.key.remoteJid;
                if (!followedNewsletters.has(newsletterJid)) {
                    await autoFollowNewsletter(xcasper, newsletterJid);
                }
            }
            
            if (store) store.addMessage(msg.key.remoteJid, msg.key.id, msg);
            handleIncomingMessage(xcasper, msg).catch(() => {});
        });
        
        return xcasper;
    } catch (error) { 
        setTimeout(async () => { await startBot(loginMode, loginData); }, 8000); 
    }
}

async function resolveJidForLog(xcasper, inputJid, groupChatJid = null) {
    if (!inputJid) return inputJid;
    if (inputJid.endsWith('@g.us') || inputJid.endsWith('@newsletter')) return inputJid;
    if (inputJid.endsWith('@lid')) {
        if (groupChatJid && groupChatJid.endsWith('@g.us')) {
            try {
                const meta = await xcasper.groupMetadata(groupChatJid);
                const p = meta?.participants?.find(x => x.id === inputJid);
                if (p?.phoneNumber) {
                    const num = String(p.phoneNumber).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (num.length >= 7) return `${num}@s.whatsapp.net`;
                }
            } catch {}
        }
        try {
            if (xcasper.signalRepository?.lidMapping?.getPNForLID) {
                const pn = await xcasper.signalRepository.lidMapping.getPNForLID(inputJid);
                if (pn) {
                    const num = String(pn).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (num.length >= 7) return `${num}@s.whatsapp.net`;
                }
            }
        } catch {}
        const lidNum = inputJid.split('@')[0];
        const cached = globalThis.lidPhoneCache?.get(lidNum);
        if (cached) return `${cached}@s.whatsapp.net`;
        try {
            if (xcasper.store?.contacts) {
                for (const [contactJid, contact] of Object.entries(xcasper.store.contacts)) {
                    if (contact.lid === inputJid || contact.lidJid === inputJid) {
                        const num = contactJid.split('@')[0].replace(/\D/g, '');
                        if (num.length >= 7) return `${num}@s.whatsapp.net`;
                    }
                }
            }
        } catch {}
        return inputJid;
    }
    const number = inputJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    return `${number}@s.whatsapp.net`;
}

async function logIncomingMessage(xcasper, msg, textMsg) {
    try {
        messageLogCounter++;
        const logNum = messageLogCounter;
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const isNewsletter = chatId.includes('@newsletter');
        const rawSenderJid = msg.key.participant || chatId;
        const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });

        let resolvedSenderJid = rawSenderJid;
        try { resolvedSenderJid = await resolveJidForLog(xcasper, rawSenderJid, isGroup ? chatId : null); } catch {}

        const phoneNumber = '+' + resolvedSenderJid.split('@')[0].split(':')[0].replace(/\D/g, '');
        
        let displayName = '';
        try {
            const contacts = xcasper.store?.contacts || {};
            const contact = contacts[resolvedSenderJid] || contacts[rawSenderJid];
            displayName = contact?.name || contact?.notify || '';
        } catch {}
        if (!displayName) displayName = phoneNumber;

        if (isNewsletter) {
            const line = '─'.repeat(42);
            originalConsoleMethods.log(chalk.cyan(
                `\n╭${line}\n` +
                `│ 📰 ${chalk.cyan.bold(`NEWSLETTER LOG #${logNum}`)}\n` +
                `├${line}\n` +
                `│ 📢 ${chalk.blue.bold('Channel :')} ${chatId}\n` +
                `│ 💬 ${chalk.blue.bold('Msg    :')} ${textMsg.substring(0, 80)}${textMsg.length > 80 ? '…' : ''}\n` +
                `│ 🕒 ${chalk.blue.bold('Time   :')} ${timeStr}\n` +
                `╰${line}`
            ));
        } else if (isGroup) {
            let groupName = chatId;
            try {
                const meta = await xcasper.groupMetadata(chatId);
                groupName = meta?.subject || chatId;
            } catch {}
            const line = '─'.repeat(42);
            originalConsoleMethods.log(chalk.cyan(
                `\n╭${line}\n` +
                `│ 🤖 ${chalk.cyan.bold(`ALICIAH AI LOG #${logNum}`)}\n` +
                `├${line}\n` +
                `│ 👥 ${chalk.blue.bold('Group  :')} ${groupName}\n` +
                `│ 👤 ${chalk.blue.bold('Sender :')} ${displayName}\n` +
                `│ ☎️  ${chalk.blue.bold('Number :')} ${phoneNumber}\n` +
                `│ 🆔 ${chalk.blue.bold('JID    :')} ${chatId}\n` +
                `│ 💬 ${chalk.blue.bold('Msg    :')} ${textMsg.substring(0, 80)}${textMsg.length > 80 ? '…' : ''}\n` +
                `│ 🕒 ${chalk.blue.bold('Time   :')} ${timeStr}\n` +
                `│ 📩 ${chalk.blue.bold('Type   :')} GROUP\n` +
                `╰${line}`
            ));
        } else {
            const line = '─'.repeat(37);
            originalConsoleMethods.log(chalk.cyan(
                `\n╭${line}\n` +
                `│ 🤖 ${chalk.cyan.bold(`ALICIAH AI LOG #${logNum}`)}\n` +
                `├${line}\n` +
                `│ 👤 ${chalk.blue.bold('Name   :')} ${displayName}\n` +
                `│ ☎️  ${chalk.blue.bold('Number :')} ${phoneNumber}\n` +
                `│ 🆔 ${chalk.blue.bold('JID    :')} ${resolvedSenderJid}\n` +
                `│ 💬 ${chalk.blue.bold('Msg    :')} ${textMsg.substring(0, 80)}${textMsg.length > 80 ? '…' : ''}\n` +
                `│ 🕒 ${chalk.blue.bold('Time   :')} ${timeStr}\n` +
                `│ 📩 ${chalk.blue.bold('Type   :')} DM\n` +
                `╰${line}`
            ));
        }
    } catch {}
}

async function handleIncomingMessage(xcasper, msg) {
    if (!isConnected) return;
    
    try {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        
        if (chatId === 'status@broadcast') return;
        
        const isOwnerUser = jidManager.isOwner(msg);
        
        if (AUTO_LINK_ENABLED && !isOwnerUser) {
            const linked = await autoLinkSystem.shouldAutoLink(xcasper, msg);
            if (linked) return;
        }
        
        if (isUserBlocked(senderJid)) return;
        
        let textMsg = '';
        if (msg.message?.conversation) {
            textMsg = msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
            textMsg = msg.message.extendedTextMessage.text;
        } else if (msg.message?.imageMessage?.caption) {
            textMsg = msg.message.imageMessage.caption;
        } else if (msg.message?.videoMessage?.caption) {
            textMsg = msg.message.videoMessage.caption;
        }
        
        if (!textMsg) return;
        
        logIncomingMessage(xcasper, msg, textMsg).catch(() => {});
        
        const currentPrefix = getCurrentPrefix();
        let commandName = '';
        let args = [];
        
        if (!isPrefixless && textMsg.startsWith(currentPrefix)) {
            const afterPrefix = textMsg.slice(currentPrefix.length);
            const spaceIndex = afterPrefix.indexOf(' ');
            if (spaceIndex === -1) {
                commandName = afterPrefix.toLowerCase().trim();
            } else {
                commandName = afterPrefix.slice(0, spaceIndex).toLowerCase().trim();
                args = afterPrefix.slice(spaceIndex).trim().split(/\s+/);
            }
        } else if (isPrefixless) {
            const words = textMsg.trim().split(/\s+/);
            const firstWord = words[0].toLowerCase();
            if (commands.has(firstWord)) {
                commandName = firstWord;
                args = words.slice(1);
            }
        }
        
        if (!commandName) return;
        
        const rateLimitCheck = rateLimiter.canSendCommand(chatId, senderJid, commandName);
        if (!rateLimitCheck.allowed) {
            await xcasper.sendMessage(chatId, { text: `⚠️ ${rateLimitCheck.reason}` }, { quoted: msg });
            return;
        }
        
        const command = commands.get(commandName);
        if (command) {
            const hasPermission = await checkCommandPermissions(xcasper, msg, command, isOwnerUser, chatId, senderJid);
            if (!hasPermission) return;
            
            try {
                if (commandName.includes('sticker')) {
                    await rateLimiter.waitForSticker(chatId);
                }
                await command.execute(xcasper, msg, args, currentPrefix, {
                    OWNER_NUMBER: OWNER_CLEAN_NUMBER,
                    OWNER_JID: OWNER_CLEAN_JID,
                    OWNER_LID,
                    BOT_NAME,
                    VERSION,
                    isOwner: () => jidManager.isOwner(msg),
                    jidManager,
                    store,
                    statusDetector,
                    updatePrefix: updatePrefixImmediately,
                    getCurrentPrefix,
                    rateLimiter,
                    memberDetector,
                    isPrefixless,
                    followedNewsletters,
                    saveFollowedNewsletters,
                    hotReload,
                    commands,
                    commandCategories
                });
            } catch (error) {
                await xcasper.sendMessage(chatId, { text: `❌ Command failed: ${error.message}` }, { quoted: msg }).catch(() => {});
            }
        }
    } catch (error) {}
}

async function handleDefaultCommands(commandName, xcasper, msg, args, currentPrefix) {
    const chatId = msg.key.remoteJid;
    try {
        switch (commandName) {
            case 'ping': 
                await xcasper.sendMessage(chatId, { text: `🤖 *ALICIAH AI v${VERSION}* — Pong! ✅\n⏱️ Uptime: ${Math.round(process.uptime())}s` }, { quoted: msg }); 
                break;
            case 'uptime': 
                const uptime = process.uptime(); 
                await xcasper.sendMessage(chatId, { text: `⏰ *Uptime:* ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s` }, { quoted: msg }); 
                break;
            case 'help': {
                let helpText = `🤖 *ALICIAH AI v${VERSION} HELP*\n\n📋 *Prefix:* ${isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`}\n📊 *Total Commands:* ${commands.size}\n\n`;
                for (const [category, cmdList] of commandCategories.entries()) { 
                    helpText += `*${category.toUpperCase()}* (${cmdList.length})\n${cmdList.map(c => `• ${currentPrefix}${c}`).join('\n')}\n\n`; 
                }
                await xcasper.sendMessage(chatId, { text: helpText }, { quoted: msg }); 
                break;
            }
        }
    } catch (error) {}
}

async function main() {
    try {
        const loginManager = new LoginManager();
        const loginInfo = await loginManager.selectMode();
        loginManager.close();
        
        if (loginInfo.mode === 'auto') {
            await startBot('auto', null);
        } else {
            const loginData = loginInfo.mode === 'session' ? loginInfo.sessionId : loginInfo.phone;
            await startBot(loginInfo.mode, loginData);
        }
    } catch (error) { 
        setTimeout(async () => { await main(); }, 8000); 
    }
}

process.on('SIGINT', () => {
    if (statusDetector) statusDetector.saveStatusLogs();
    if (memberDetector) memberDetector.saveDetectionData();
    saveFollowedNewsletters();
    if (hotReload) hotReload.stopWatching();
    stopHeartbeat();
    if (XCASPER_INSTANCE) XCASPER_INSTANCE.ws.close();
    process.exit(0);
});

process.on('uncaughtException', (error) => {});
process.on('unhandledRejection', (error) => {});

setInterval(() => { 
    if (isConnected && (Date.now() - lastActivityTime) > 5 * 60 * 1000 && XCASPER_INSTANCE) { 
        XCASPER_INSTANCE.sendPresenceUpdate('available').catch(() => {}); 
    } 
}, 60000);

main().catch(() => { process.exit(1); });
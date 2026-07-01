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
import axios from 'axios';

dotenv.config({ path: './.env' });

let messageLogCounter = 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSION_DIR = './session';
let BOT_NAME = process.env.BOT_NAME || 'ALICIAH AI';
const BOT_NAME_FILE = './data/botname.json';
const VERSION = '2.0.0';
const DEFAULT_PREFIX = process.env.BOT_PREFIX || '.';
const OWNER_FILE = './owner.json';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_SETTINGS_FILE = './bot_settings.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';
const BLOCKED_USERS_FILE = './blocked_users.json';
const ANTI_SETTINGS_FILE = './data/anti_settings.json';
const WARN_COUNTS_FILE   = './data/warn_counts.json';
const SUDO_FILE = './data/sudo.json';
const DEV_NUMBER = '254732982940';
const WELCOME_DATA_FILE = './data/welcome_data.json';
const NEWSLETTERS_FILE = './data/newsletters.json';
const GROUP_METADATA_FILE = './data/group_metadata.json';
const NEWSLETTER_METADATA_FILE = './data/newsletter_metadata.json';
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
const COMMUNITY_NEWSLETTERS = [
    '120363419521878542@newsletter',  // default
    '120363427391708590@newsletter',  // XCASPER community channel
];
const AUTO_JOIN_GROUP_CODES = [
    'Dn96FiLb85i8ypo8fChbVL',  // XCASPER SPACE
];
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
    process.env.BOT_PREFIX = getCurrentPrefix();
    savePrefixToFile(newPrefix);
    prefixHistory.push({ oldPrefix: oldIsPrefixless ? 'none' : oldPrefix, newPrefix: isPrefixless ? 'none' : prefixCache, isPrefixless, oldIsPrefixless, timestamp: new Date().toISOString(), time: Date.now() });
    if (prefixHistory.length > 10) prefixHistory = prefixHistory.slice(-10);
    updateTerminalHeader();
    return { success: true, oldPrefix: oldIsPrefixless ? 'none' : oldPrefix, newPrefix: isPrefixless ? 'none' : prefixCache, isPrefixless, timestamp: new Date().toISOString() };
}

function updateTerminalHeader() {
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
    originalConsoleMethods.log(chalk.cyan(`
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

function loadBotName() {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        if (fs.existsSync(BOT_NAME_FILE)) {
            const data = JSON.parse(fs.readFileSync(BOT_NAME_FILE, 'utf8'));
            if (data.name && data.name.trim()) BOT_NAME = data.name.trim();
        }
    } catch {}
}

function saveBotName(name) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        BOT_NAME = name.trim();
        process.env.BOT_NAME = BOT_NAME;
        fs.writeFileSync(BOT_NAME_FILE, JSON.stringify({ name: BOT_NAME, updatedAt: new Date().toISOString() }, null, 2));
        return true;
    } catch { return false; }
}

loadBotName();
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
// ── Anti-Delete JSON DB ──────────────────────────────────────────────
const ANTIDELETE_DB_FILE   = './data/antidelete_db.json';
const ANTIDELETE_MAX_AGE   = 3 * 60 * 60 * 1000;   // 3 hours in ms
const ANTIDELETE_MAX_TOTAL = 2000;                   // cap total stored msgs

function loadAntiDeleteDb() {
    try {
        if (fs.existsSync(ANTIDELETE_DB_FILE))
            return JSON.parse(fs.readFileSync(ANTIDELETE_DB_FILE, 'utf8'));
    } catch {}
    return {};
}
function saveAntiDeleteDb(db) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(ANTIDELETE_DB_FILE, JSON.stringify(db, null, 2));
    } catch {}
}
function addToAntiDeleteDb(msg) {
    try {
        const chatId = msg.key?.remoteJid;
        const msgId  = msg.key?.id;
        if (!chatId || !msgId || chatId === 'status@broadcast') return;
        if (chatId.includes('@newsletter')) return;
        const skipKeys = new Set(['messageContextInfo','senderKeyDistributionMessage','protocolMessage','deviceSentMessage']);
        const contentType = Object.keys(msg.message || {}).find(k => !skipKeys.has(k));
        if (!contentType) return;
        const db  = loadAntiDeleteDb();
        const key = `${chatId}:${msgId}`;
        // Resolve real phone number NOW while LID→phone cache is warm.
        // atasa pattern: store realNumber at capture time so retrieval never needs an API call.
        const rawSender = msg.key.participant || chatId;
        let realNumber  = null;
        const bareSender = rawSender.split(':')[0];
        if (bareSender.endsWith('@s.whatsapp.net')) {
            realNumber = bareSender.split('@')[0];
        } else if (bareSender.endsWith('@lid')) {
            const lidNum = bareSender.split('@')[0];
            const phone  = globalThis.lidPhoneCache?.get(lidNum);
            if (phone) realNumber = phone;
        }
        db[key] = {
            key:        msg.key,
            message:    msg.message,
            sender:     rawSender,
            pushName:   msg.pushName || '',
            realNumber, // phone digits only e.g. '254712345678', or null if unresolvable
            chatId,
            timestamp:  Date.now()
        };
        // prune oldest if over cap
        const keys = Object.keys(db);
        if (keys.length > ANTIDELETE_MAX_TOTAL) {
            keys.sort((a, b) => (db[a].timestamp || 0) - (db[b].timestamp || 0));
            keys.slice(0, keys.length - ANTIDELETE_MAX_TOTAL).forEach(k => delete db[k]);
        }
        saveAntiDeleteDb(db);
    } catch {}
}
function cleanOldAntiDeleteEntries() {
    try {
        const db  = loadAntiDeleteDb();
        const now = Date.now();
        let changed = false;
        for (const k of Object.keys(db)) {
            if (now - (db[k].timestamp || 0) > ANTIDELETE_MAX_AGE) {
                delete db[k]; changed = true;
            }
        }
        if (changed) saveAntiDeleteDb(db);
        const remaining = Object.keys(db).length;
        if (remaining > 0)
            originalConsoleMethods.log(`[ANTI-DELETE] 🧹 DB cleaned — ${remaining} messages cached`);
    } catch {}
}
// Run cleanup every hour
setInterval(cleanOldAntiDeleteEntries, 60 * 60 * 1000);
let heartbeatInterval = null, lastActivityTime = Date.now();
let BOT_MODE = 'public', WHITELIST = new Set(), AUTO_LINK_ENABLED = true;
let SUDO_USERS = new Set();

function loadSudos() {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        if (fs.existsSync(SUDO_FILE)) {
            const data = JSON.parse(fs.readFileSync(SUDO_FILE, 'utf8'));
            if (Array.isArray(data.sudos)) {
                SUDO_USERS = new Set(data.sudos);
            }
        }
    } catch {}
}

function saveSudos() {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(SUDO_FILE, JSON.stringify({
            sudos: Array.from(SUDO_USERS),
            updatedAt: new Date().toISOString(),
            total: SUDO_USERS.size
        }, null, 2));
    } catch {}
}

function isDevUser(msg) {
    if (!msg || !msg.key) return false;
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const number = senderJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    return number === DEV_NUMBER || senderJid.includes(DEV_NUMBER);
}

function isSudoUser(jid) {
    if (!jid) return false;
    const number = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
    if (number === DEV_NUMBER || jid.includes(DEV_NUMBER)) return true;
    if (SUDO_USERS.has(jid)) return true;
    for (const sudoJid of SUDO_USERS) {
        const sudoNum = sudoJid.split('@')[0].replace(/\D/g, '');
        if (sudoNum && number && sudoNum === number) return true;
    }
    return false;
}

loadSudos();
let AUTO_CONNECT_COMMAND_ENABLED = true, AUTO_ULTIMATE_FIX_ENABLED = true;
let isWaitingForPairingCode = false, RESTART_AUTO_FIX_ENABLED = true;
let hasAutoConnectedOnStart = false;
let followedNewsletters = new Set();
const groupMetadataCache = new Map();      // jid → groupMetadata object
const newsletterMetadataCache = new Map(); // jid → newsletter metadata object
let hotReload = null;

// RECONNECTION TRACKERS - NO MESSAGES
let reconnectAttempts = 0;
let reconnectTimer = null;
let connectionOpenHandled = false;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Toggle via eval:  > rawMsgLogging = true  (or false to stop)
let rawMsgLogging = false;

// ============ HELPER FUNCTIONS FOR MEDIA HANDLING ============

/**
 * Get quoted message from the original message
 * @param {Object} msg - The WhatsApp message object
 * @returns {Object|null} The quoted message or null
 */
function getQuotedMessage(msg) {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) return quoted;
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Check if a message contains a sticker
 * @param {Object} msg - The WhatsApp message object
 * @returns {boolean} True if message contains a sticker
 */
function isStickerMessage(msg) {
    try {
        if (msg.message?.stickerMessage) return true;
        const quoted = getQuotedMessage(msg);
        if (quoted?.stickerMessage) return true;
        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Check if a message contains an image
 * @param {Object} msg - The WhatsApp message object
 * @returns {boolean} True if message contains an image
 */
function isImageMessage(msg) {
    try {
        if (msg.message?.imageMessage) return true;
        const quoted = getQuotedMessage(msg);
        if (quoted?.imageMessage) return true;
        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Check if a message contains a video
 * @param {Object} msg - The WhatsApp message object
 * @returns {boolean} True if message contains a video
 */
function isVideoMessage(msg) {
    try {
        if (msg.message?.videoMessage) return true;
        const quoted = getQuotedMessage(msg);
        if (quoted?.videoMessage) return true;
        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Get the media message (image, video, or sticker) from a WhatsApp message
 * @param {Object} msg - The WhatsApp message object
 * @returns {Object|null} The media message object or null
 */
function getMediaMessage(msg) {
    try {
        // Check direct message first
        if (msg.message?.imageMessage) return msg.message.imageMessage;
        if (msg.message?.videoMessage) return msg.message.videoMessage;
        if (msg.message?.stickerMessage) return msg.message.stickerMessage;
        
        // Check quoted message
        const quoted = getQuotedMessage(msg);
        if (quoted?.imageMessage) return quoted.imageMessage;
        if (quoted?.videoMessage) return quoted.videoMessage;
        if (quoted?.stickerMessage) return quoted.stickerMessage;
        
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Get the direct URL of a media message
 * @param {Object} mediaMsg - The media message object
 * @returns {string|null} The media URL or null
 */
function getMediaUrl(mediaMsg) {
    try {
        if (!mediaMsg) return null;
        if (mediaMsg.url) return mediaMsg.url;
        if (mediaMsg.directPath) return mediaMsg.directPath;
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Download media from a message using axios (most reliable method)
 * @param {Object} mediaMsg - The media message object
 * @returns {Promise<Buffer|null>} The media buffer or null
 */
async function downloadMediaAsBuffer(mediaMsg) {
    try {
        const url = getMediaUrl(mediaMsg);
        if (!url) {
            throw new Error('No media URL found');
        }
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const buffer = Buffer.from(response.data);
        
        if (buffer.length === 0) {
            throw new Error('Downloaded file is empty');
        }
        
        return buffer;
    } catch (error) {
        console.error('Error downloading media:', error.message);
        return null;
    }
}

// Make helper functions available globally for commands
global.getQuotedMessage = getQuotedMessage;
global.isStickerMessage = isStickerMessage;
global.isImageMessage = isImageMessage;
global.isVideoMessage = isVideoMessage;
global.getMediaMessage = getMediaMessage;
global.getMediaUrl = getMediaUrl;
global.downloadMediaAsBuffer = downloadMediaAsBuffer;

const AUTO_STATUS_SETTINGS_FILE = './data/auto_status_settings.json';

function getAutoStatusSettings() {
    try {
        if (fs.existsSync(AUTO_STATUS_SETTINGS_FILE)) {
            return JSON.parse(fs.readFileSync(AUTO_STATUS_SETTINGS_FILE, 'utf8'));
        }
    } catch {}
    return {
        autoviewStatus: 'true',
        autoLikeStatus: 'false',
        autoReplyStatus: 'false',
        statusLikeEmojis: '🩵',
        statusReplyText: '🔥 Nice status!'
    };
}

function saveAutoStatusSettings(settings) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const current = getAutoStatusSettings();
        const merged = { ...current, ...settings, updatedAt: new Date().toISOString() };
        fs.writeFileSync(AUTO_STATUS_SETTINGS_FILE, JSON.stringify(merged, null, 2));
        return { success: true, settings: merged };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

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

// ── Group metadata cache ──────────────────────────────────────────────────────

function loadGroupMetadataCache() {
    try {
        if (fs.existsSync(GROUP_METADATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(GROUP_METADATA_FILE, 'utf8'));
            if (data.groups && typeof data.groups === 'object') {
                for (const [jid, meta] of Object.entries(data.groups)) {
                    groupMetadataCache.set(jid, meta);
                }
            }
        }
    } catch (_) {}
}

function saveGroupMetadataCache() {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const groups = {};
        for (const [jid, meta] of groupMetadataCache.entries()) groups[jid] = meta;
        fs.writeFileSync(GROUP_METADATA_FILE, JSON.stringify({
            groups,
            updatedAt: new Date().toISOString(),
            total: groupMetadataCache.size
        }, null, 2));
    } catch (_) {}
}

async function refreshGroupMetadataCache(xcasper) {
    try {
        const all = await xcasper.groupFetchAllParticipating();
        for (const [jid, meta] of Object.entries(all)) {
            groupMetadataCache.set(jid, meta);
        }
        saveGroupMetadataCache();
    } catch (_) {}
}

// ── Newsletter metadata cache ─────────────────────────────────────────────────

function loadNewsletterMetadataCache() {
    try {
        if (fs.existsSync(NEWSLETTER_METADATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(NEWSLETTER_METADATA_FILE, 'utf8'));
            if (data.newsletters && typeof data.newsletters === 'object') {
                for (const [jid, meta] of Object.entries(data.newsletters)) {
                    newsletterMetadataCache.set(jid, meta);
                }
            }
        }
    } catch (_) {}
}

function saveNewsletterMetadataCache() {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const newsletters = {};
        for (const [jid, meta] of newsletterMetadataCache.entries()) newsletters[jid] = meta;
        fs.writeFileSync(NEWSLETTER_METADATA_FILE, JSON.stringify({
            newsletters,
            updatedAt: new Date().toISOString(),
            total: newsletterMetadataCache.size
        }, null, 2));
    } catch (_) {}
}

function parseNewsletterMeta(raw) {
    if (!raw) return null;
    const t = raw.thread_metadata || {};
    const name        = raw.name || (typeof t.name === 'object' ? t.name?.text : t.name) || '';
    const description = raw.description || t.description?.text || t.description || '';
    const subscribers = raw.subscribers ?? (t.subscribers_count ? parseInt(t.subscribers_count, 10) : null);
    const invite      = raw.invite || t.invite || '';
    const rawId       = raw.id || '';
    const jid         = rawId.includes('@newsletter') ? rawId : `${rawId}@newsletter`;
    return { jid, name, description, subscribers, invite, verification: raw.verification || t.verification || '', cachedAt: new Date().toISOString() };
}

async function cacheNewsletterMetadata(xcasper, newsletterJid) {
    try {
        const raw = await xcasper.newsletterMetadata('jid', newsletterJid);
        const parsed = parseNewsletterMeta(raw);
        if (parsed) {
            newsletterMetadataCache.set(newsletterJid, parsed);
            saveNewsletterMetadataCache();
        }
    } catch (_) {}
}

// ── Auto-follow newsletter ────────────────────────────────────────────────────

async function autoFollowNewsletter(xcasper, newsletterJid) {
    try {
        if (!newsletterJid || !newsletterJid.includes('@newsletter')) return false;
        if (followedNewsletters.has(newsletterJid)) {
            // still refresh metadata if not cached
            if (!newsletterMetadataCache.has(newsletterJid)) await cacheNewsletterMetadata(xcasper, newsletterJid);
            return true;
        }
        await xcasper.newsletterFollow(newsletterJid);
        followedNewsletters.add(newsletterJid);
        saveFollowedNewsletters();
        await cacheNewsletterMetadata(xcasper, newsletterJid);
        return true;
    } catch (error) {
        return false;
    }
}

async function autoFollowAllNewsletters(xcasper) {
    const newsletters = [...new Set([...COMMUNITY_NEWSLETTERS])];
    if (process.env.EXTRA_NEWSLETTERS) {
        const extra = process.env.EXTRA_NEWSLETTERS.split(',').map(s => s.trim()).filter(Boolean);
        newsletters.push(...extra);
    }
    for (const newsletter of newsletters) {
        await autoFollowNewsletter(xcasper, newsletter);
        await delay(1000);
    }
}

async function autoJoinGroups(xcasper) {
    for (const code of AUTO_JOIN_GROUP_CODES) {
        try {
            await xcasper.groupAcceptInvite(code);
        } catch (_) {
            // already a member or invite expired — ignore silently
        }
        await delay(2000);
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

function loadAntiSettings() {
    try { if (fs.existsSync(ANTI_SETTINGS_FILE)) return JSON.parse(fs.readFileSync(ANTI_SETTINGS_FILE, 'utf8')); } catch {}
    return { antisticker: {}, antiall: {}, antidelete: { enabled: false, mode: 'samechat' } };
}
function saveAntiSettings(data) {
    try { if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true }); fs.writeFileSync(ANTI_SETTINGS_FILE, JSON.stringify(data, null, 2)); } catch {}
}
function loadWarnCounts() {
    try { if (fs.existsSync(WARN_COUNTS_FILE)) return JSON.parse(fs.readFileSync(WARN_COUNTS_FILE, 'utf8')); } catch {}
    return {};
}
function saveWarnCounts(data) {
    try { if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true }); fs.writeFileSync(WARN_COUNTS_FILE, JSON.stringify(data, null, 2)); } catch {}
}

async function handleAntiViolation(xcasper, msg, senderJid, chatId, type) {
    const MAX_WARNS = 5;
    const isGroup = chatId.endsWith('@g.us');
    const warns = loadWarnCounts();
    const warnKey = `${chatId}:${senderJid}:${type}`;
    warns[warnKey] = (warns[warnKey] || 0) + 1;
    const count = warns[warnKey];

    // Delete message in group if possible
    if (isGroup) {
        try { await xcasper.sendMessage(chatId, { delete: msg.key }); } catch {}
    }

    if (count >= MAX_WARNS) {
        const phoneJid = senderJid.includes('@s.whatsapp.net') ? senderJid : senderJid.split(':')[0] + '@s.whatsapp.net';
        const label = type === 'sticker' ? 'Repeated sticker violations' : 'Sending restricted messages';
        await xcasper.sendMessage(chatId, {
            text: `🚫 *@${phoneJid.split('@')[0]} has been blocked!*\nReason: ${label} (${MAX_WARNS}/${MAX_WARNS} warnings)`,
            mentions: [phoneJid]
        });
        try { await xcasper.updateBlockStatus(phoneJid, 'block'); } catch {}
        delete warns[warnKey];
    } else {
        const typeLabel = type === 'sticker' ? '🚫 Stickers are not allowed here!' : '🚫 Sending messages is restricted here!';
        await xcasper.sendMessage(chatId, {
            text: `⚠️ *Warning ${count}/${MAX_WARNS}* — @${senderJid.split('@')[0]}\n${typeLabel}\n_${MAX_WARNS - count} more warning(s) before block._`,
            mentions: [senderJid]
        });
    }
    saveWarnCounts(warns);
}

// Resolve any JID (including @lid) to a phone @s.whatsapp.net JID for mentions.
// Tries: 1) already a phone JID, 2) lidPhoneCache, 3) Baileys getJidFromLid API.
// Returns null if unresolvable — caller skips the mention in that case.
async function resolvePhoneJid(sock, jid) {
    if (!jid) return null;
    const bare = jid.split(':')[0]; // strip device suffix e.g. :0
    if (bare.endsWith('@s.whatsapp.net')) return bare;
    if (bare.endsWith('@lid')) {
        const lidNum = bare.split('@')[0];
        // 1. Local cache
        const cached = globalThis.lidPhoneCache?.get(lidNum);
        if (cached) return `${cached}@s.whatsapp.net`;
        // 2. Live Baileys API
        try {
            const result = await sock.getJidFromLid(bare);
            if (result && result.includes('@s.whatsapp.net')) return result.split(':')[0];
        } catch {}
        return null; // genuinely unresolvable
    }
    return null; // group JID or other — not mentionable
}

async function forwardAntiDelete(xcasper, originalMsg, dest, originalChatId, { deleterJid = null, groupName = null } = {}) {
    try {
        const { downloadMediaMessage } = await import('@whiskeysockets/baileys');

        const rawSenderJid    = originalMsg.key.participant || originalMsg.key.remoteJid || '';
        // Priority: realNumber stored at capture time → live resolve → null
        let senderPhoneJid;
        if (originalMsg.realNumber) {
            senderPhoneJid = `${originalMsg.realNumber}@s.whatsapp.net`;
        } else {
            senderPhoneJid = await resolvePhoneJid(xcasper, rawSenderJid);
        }
        const senderNum = senderPhoneJid ? senderPhoneJid.split('@')[0] : null;
        const isGroup         = originalChatId.endsWith('@g.us');
        const chatLabel       = isGroup ? `👥 Group${groupName ? `: ${groupName}` : ''}` : '👤 DM';
        const timeStr         = new Date().toLocaleTimeString();

        // Build mentions array — only valid @s.whatsapp.net JIDs go in here
        const mentions = [];
        if (senderPhoneJid) mentions.push(senderPhoneJid);

        // Only use pushName if it's a real name (not blank, dot-only, or whitespace)
        const cleanName = (originalMsg.pushName || '').trim().replace(/^[.\s]+$/, '');
        // Sender display: show name + @mention if phone resolved, else just name or "Unknown"
        let senderDisplay;
        if (senderPhoneJid && cleanName) {
            senderDisplay = `${cleanName} @${senderNum}`;
        } else if (senderPhoneJid) {
            senderDisplay = `@${senderNum}`;
        } else if (cleanName) {
            senderDisplay = cleanName;
        } else {
            senderDisplay = 'Unknown';
        }

        let notice = `🗑️ *Deleted Message Caught*\n👤 Sender: ${senderDisplay}\n📍 Chat: ${chatLabel}\n🕒 Time: ${timeStr}`;

        if (deleterJid && deleterJid !== rawSenderJid) {
            const delPhoneJid = await resolvePhoneJid(xcasper, deleterJid);
            const delNum      = delPhoneJid ? delPhoneJid.split('@')[0] : null;
            if (delPhoneJid && delNum) {
                notice += `\n🗑️ Deleted by: @${delNum}`;
                if (!mentions.includes(delPhoneJid)) mentions.push(delPhoneJid);
            }
        }

        const m = originalMsg.message;
        const skipKeys = new Set(['messageContextInfo', 'senderKeyDistributionMessage', 'protocolMessage', 'deviceSentMessage']);
        const contentType = Object.keys(m || {}).find(k => !skipKeys.has(k));
        if (!contentType) return;

        // ── Text messages ────────────────────────────────────────────────
        if (contentType === 'conversation' || contentType === 'extendedTextMessage') {
            const text = m.conversation || m.extendedTextMessage?.text || '';
            if (text) {
                await xcasper.sendMessage(dest, {
                    text: `${notice}\n\n💬 *Message:*\n${text}`,
                    mentions
                }, { quoted: originalMsg });
            }
            return;
        }

        // ── Media messages — use downloadMediaMessage with reuploadRequest ─
        const mediaTypes = { imageMessage:'image', videoMessage:'video', audioMessage:'audio', stickerMessage:'sticker', documentMessage:'document' };
        const mType = mediaTypes[contentType];
        if (!mType) return;

        const mediaMsg = m[contentType];
        let buffer;
        try {
            buffer = await downloadMediaMessage(
                originalMsg,
                'buffer',
                {},
                { reuploadRequest: xcasper.updateMediaMessage, logger: ultraSilentLogger }
            );
        } catch {
            await xcasper.sendMessage(dest, {
                text: `${notice}\n\n⚠️ Media could not be retrieved (expired or unavailable)`,
                mentions
            }, { quoted: originalMsg });
            return;
        }

        // Send header notice (with mention + quoted)
        await xcasper.sendMessage(dest, { text: notice, mentions }, { quoted: originalMsg });

        // Send the actual media
        let payload;
        if (contentType === 'imageMessage') {
            payload = { image: buffer, caption: mediaMsg.caption || '', mentions };
        } else if (contentType === 'videoMessage') {
            payload = { video: buffer, caption: mediaMsg.caption || '', gifPlayback: mediaMsg.gifPlayback || false, mentions };
        } else if (contentType === 'audioMessage') {
            payload = { audio: buffer, mimetype: mediaMsg.mimetype || 'audio/mp4', ptt: mediaMsg.ptt || false };
        } else if (contentType === 'stickerMessage') {
            payload = { sticker: buffer };
        } else if (contentType === 'documentMessage') {
            payload = { document: buffer, mimetype: mediaMsg.mimetype || 'application/octet-stream', fileName: mediaMsg.fileName || 'file', caption: mediaMsg.caption || '', mentions };
        }
        if (payload) await xcasper.sendMessage(dest, payload);

    } catch (err) {
        originalConsoleMethods.log(`[ANTI-DELETE] forward error: ${err.message}`);
    }
}

function saveBotMode(mode) {
    const valid = ['public', 'private', 'group-only', 'maintenance', 'silent'];
    if (!valid.includes(mode)) return { success: false, error: `Invalid mode. Use: ${valid.join(', ')}` };
    try {
        BOT_MODE = mode;
        fs.writeFileSync(BOT_MODE_FILE, JSON.stringify({ mode, setAt: new Date().toISOString() }, null, 2));
        return { success: true, mode };
    } catch (err) { return { success: false, error: err.message }; }
}

function checkBotMode(msg, commandName) {
    try {
        if (isDevUser(msg)) return true;
        if (jidManager.isOwner(msg)) return true;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        if (isSudoUser(senderJid)) return true;
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
    const isDev = isDevUser(msg);
    const isSudo = isSudoUser(senderJid);

    if (isDev) return true;

    if (command.devOnly && !isDev) {
        await xcasper.sendMessage(chatId, { text: '🛠️ *Dev Only Command*\n\nThis command is restricted to the bot developer.' }, { quoted: msg });
        return false;
    }

    if (command.ownerOnly && !isOwnerUser && !isSudo) {
        await xcasper.sendMessage(chatId, { text: '❌ *Owner Only Command*\n\nThis command can only be used by the bot owner or sudo users.' }, { quoted: msg });
        return false;
    }

    if (command.sudoOnly && !isSudo && !isOwnerUser) {
        await xcasper.sendMessage(chatId, { text: '🔐 *Sudo Only Command*\n\nThis command requires sudo privileges.' }, { quoted: msg });
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
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || isOwnerUser || isSudo;
        } catch (error) {
            isAdmin = isOwnerUser || isSudo;
        }
        
        if (!isAdmin) {
            await xcasper.sendMessage(chatId, { text: '❌ *Admin Only Command*\n\nThis command requires admin privileges in this group.' }, { quoted: msg });
            return false;
        }
    }
    
    if (command.whitelistOnly && !WHITELIST.has(senderJid) && !isOwnerUser && !isSudo) {
        await xcasper.sendMessage(chatId, { text: '❌ *Whitelist Only Command*\n\nYou are not whitelisted to use this command.' }, { quoted: msg });
        return false;
    }
    
    return true;
}

function startHeartbeat(xcasper) {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(async () => {
        if (!isConnected || !xcasper) return;
        try { await xcasper.sendPresenceUpdate('available'); lastActivityTime = Date.now(); } catch {}
    }, 20 * 1000);
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

function autoSaveSessionToEnv(xcasper, isFreshPair = false) {
    // Delay to allow saveCreds to fully write creds.json first
    setTimeout(async () => {
        try {
            const credsPath = path.join(SESSION_DIR, 'creds.json');
            if (!fs.existsSync(credsPath)) {
                originalConsoleMethods.log(chalk.yellow('⚠️ autoSaveSessionToEnv: creds.json not found yet, skipping.'));
                return;
            }
            const credsJson = fs.readFileSync(credsPath, 'utf8');
            const base64 = Buffer.from(credsJson).toString('base64');
            const sessionId = `ALICIAH-AI:${base64}`;

            let envContent = '';
            if (fs.existsSync('./.env')) {
                envContent = fs.readFileSync('./.env', 'utf8');
            }

            const sessionIdLine = `SESSION_ID=${sessionId}`;
            if (envContent.includes('SESSION_ID=')) {
                envContent = envContent.replace(/^SESSION_ID=.*/m, sessionIdLine);
            } else {
                envContent = envContent.trimEnd();
                envContent = envContent ? `${envContent}\n${sessionIdLine}\n` : `${sessionIdLine}\n`;
            }

            fs.writeFileSync('./.env', envContent, 'utf8');
            process.env.SESSION_ID = sessionId;
            originalConsoleMethods.log(chalk.greenBright('\n✅ SESSION_ID auto-saved to .env — your session is safe from git pulls!\n'));

            if (isFreshPair && xcasper && xcasper.user && xcasper.user.id) {
                // Strip device suffix: e.g. "254xxx:7@s.whatsapp.net" → "254xxx@s.whatsapp.net"
                const rawJid = xcasper.user.id;
                const botJid = rawJid.includes(':')
                    ? rawJid.split(':')[0] + '@s.whatsapp.net'
                    : rawJid;

                originalConsoleMethods.log(chalk.cyan(`📤 Sending session backup to bot number: ${botJid}`));
                try {
                    const sessionMsg = await xcasper.sendMessage(botJid, { text: sessionId });
                    await xcasper.sendMessage(botJid, {
                        text: `🔐 *ALICIAH AI — SESSION BACKUP*\n` +
                              `✅ Session saved successfully!\n\n` +
                              `📌 *To restore on any server:*\n` +
                              `Copy the message above and set it as your SESSION_ID env variable, or paste it at login option 3.\n\n` +
                              `_🤖 ALICIAH AI v${VERSION} — Auto Backup_`
                    }, { quoted: sessionMsg });
                    originalConsoleMethods.log(chalk.greenBright('✅ Session ID sent to bot number as backup!\n'));
                } catch (sendErr) {
                    originalConsoleMethods.log(chalk.yellow(`⚠️ Could not send session to bot number: ${sendErr.message}`));
                }
            }
        } catch (err) {
            originalConsoleMethods.log(chalk.yellow(`⚠️ Could not auto-save session to .env: ${err.message}`));
        }
    }, 8000);
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

function hasValidSavedSession() {
    try {
        const credsPath = path.join(SESSION_DIR, 'creds.json');
        if (!fs.existsSync(credsPath)) return false;
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        return !!(creds && creds.me && creds.me.id && creds.registered);
    } catch { return false; }
}

class LoginManager {
    constructor() { this.rl = readline.createInterface({ input: process.stdin, output: process.stdout }); }
    
    async selectMode() {
        const sessionExists = fs.existsSync(SESSION_DIR);
        const credsExists = fs.existsSync(path.join(SESSION_DIR, 'creds.json'));
        const hasValidSession = sessionExists && credsExists && hasValidSavedSession();
        
        if (AUTO_RESTART && hasValidSession) {
            originalConsoleMethods.log(chalk.green('\n✅ Auto-restart enabled. Restoring existing session...'));
            return { mode: 'auto', phone: null };
        }

        if (hasValidSession) {
            originalConsoleMethods.log(chalk.green('\n✅ Existing session detected! Auto-connecting...'));
            return { mode: 'auto', phone: null };
        }

        if (sessionExists && credsExists && !hasValidSession) {
            originalConsoleMethods.log(chalk.yellow('\n⚠️ Found stale or invalid session data. Please re-login using the pairing code.'));
        }
        
        originalConsoleMethods.log(chalk.yellow('\n⚠️ No session found. Please login:'));
        originalConsoleMethods.log(chalk.cyan('\n🤖 ALICIAH AI v' + VERSION + ' - LOGIN SYSTEM'));
        originalConsoleMethods.log(chalk.blue('1) Pairing Code Login (Recommended)'));
        originalConsoleMethods.log(chalk.blue('2) Clean Session & Start Fresh'));
        originalConsoleMethods.log(chalk.magenta('3) Use Session ID from Environment'));
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
        originalConsoleMethods.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
        const phone = await this.ask('Phone number (with country code, no +): ');
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!cleanPhone || cleanPhone.length < 7) {
            originalConsoleMethods.log(chalk.red('❌ Invalid phone number — too short. Must be 7–15 digits.'));
            return await this.pairingCodeMode();
        }
        if (cleanPhone.length > 15) {
            originalConsoleMethods.log(chalk.red(`❌ Invalid phone number — too long (${cleanPhone.length} digits). Max is 15 digits.`));
            return await this.pairingCodeMode();
        }
        originalConsoleMethods.log(chalk.green(`✅ Phone accepted: +${cleanPhone}`));
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
            const startTime = Date.now();
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

    // 401 = WhatsApp explicitly logged us out — only time we wipe the session
    if (statusCode === 401) {
        if (isWaitingForPairingCode) {
            originalConsoleMethods.log(chalk.cyan('🔄 Connection reset during pairing — reconnecting, your code is still valid...'));
            setTimeout(async () => { await startBot(loginMode, phoneNumber); }, 3000);
            return;
        }
        cleanSession();
        reconnectAttempts = 0;
        originalConsoleMethods.log(chalk.yellow('⚠️ Logged out by WhatsApp. Session cleared — re-pairing in 3s...'));
        setTimeout(async () => { await main(); }, 3000);
        return;
    }

    // 403 / 419 / 408 / 515 / undefined = transient drop — reconnect WITHOUT wiping session
    reconnectAttempts++;
    // Cap at 30s after a few retries; reset counter once we reconnect successfully
    const retryDelay = Math.min(3000 * Math.pow(1.5, reconnectAttempts - 1), 30000);

    reconnectTimer = setTimeout(() => {
        startBot(loginMode, phoneNumber);
    }, retryDelay);
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
    
    originalConsoleMethods.log(chalk.green(`\n✅ ALICIAH AI Connected | Owner: +${ownerInfo.ownerNumber}\n`));
    
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
        loadGroupMetadataCache();
        loadNewsletterMetadataCache();
        
        const { default: makeWASocket } = await import('@whiskeysockets/baileys');
        const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, getContentType } = await import('@whiskeysockets/baileys');
        
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
            keepAliveIntervalMs: 10000, 
            emitOwnEvents: true, 
            mobile: false, 
            getMessage: async (key) => store?.getMessage(key.remoteJid, key.id) || null,
            cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid) || null,
            defaultQueryTimeoutMs: 30000 
        });
        
        XCASPER_INSTANCE = xcasper;
        reconnectAttempts = 0;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        isWaitingForPairingCode = false;

        xcasper.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open' && !connectionOpenHandled) {
                connectionOpenHandled = true;
                reconnectAttempts = 0;
                isConnected = true;
                startHeartbeat(xcasper);
                autoSaveSessionToEnv(xcasper, loginMode === 'pair');
                await handleSuccessfulConnection(xcasper, loginMode, loginData);
                isWaitingForPairingCode = false;
                
                setTimeout(async () => {
                    await autoFollowAllNewsletters(xcasper);
                    await autoJoinGroups(xcasper);
                    await refreshGroupMetadataCache(xcasper);
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
            let pairingExpireTimer = null;
            const requestCode = async (attempt = 1) => {
                if (state.creds.registered || isConnected) return;
                isWaitingForPairingCode = true;
                try {
                    originalConsoleMethods.log(chalk.cyan(`\n⏳ Requesting pairing code (attempt ${attempt})...`));
                    const code = await xcasper.requestPairingCode(loginData);
                    const cleanCode = code.replace(/\s+/g, '');
                    const formattedCode = cleanCode.length === 8 ? `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}` : cleanCode;
                    originalConsoleMethods.log(chalk.greenBright(`\n╔══════════════════════════════════════════╗\n║         🔗 PAIRING CODE - ALICIAH AI        \n╠══════════════════════════════════════════╣\n║ 📞 Phone  : ${chalk.cyan(loginData)}\n║ 🔑 Code   : ${chalk.yellow.bold(formattedCode)}\n║ ⏰ Expires : 10 minutes\n╚══════════════════════════════════════════╝\n`));
                    originalConsoleMethods.log(chalk.cyan('📱 INSTRUCTIONS:'));
                    originalConsoleMethods.log(chalk.white('1. Open WhatsApp → Settings → Linked Devices'));
                    originalConsoleMethods.log(chalk.white('2. Tap "Link a Device"'));
                    originalConsoleMethods.log(chalk.yellow.bold(`3. Enter code: ${formattedCode}\n`));
                    if (pairingExpireTimer) clearTimeout(pairingExpireTimer);
                    pairingExpireTimer = setTimeout(async () => {
                        if (!isConnected) {
                            originalConsoleMethods.log(chalk.yellow('\n⏰ Pairing code expired — requesting a new one automatically...'));
                            isWaitingForPairingCode = false;
                            await requestCode(attempt + 1);
                        }
                    }, 9.5 * 60 * 1000);
                } catch (error) {
                    isWaitingForPairingCode = false;
                    const msg = error?.message || String(error);
                    originalConsoleMethods.log(chalk.red(`\n❌ Failed to get pairing code: ${msg}`));
                    if (attempt < 3) {
                        originalConsoleMethods.log(chalk.yellow(`🔄 Retrying in 5 seconds... (${attempt}/3)`));
                        setTimeout(() => requestCode(attempt + 1), 5000);
                    } else {
                        originalConsoleMethods.log(chalk.red('🚨 Could not get a pairing code after 3 attempts. Returning to login menu...'));
                        setTimeout(async () => { await main(); }, 3000);
                    }
                }
            };
            setTimeout(() => requestCode(), 2000);
        }

        xcasper.ev.on('creds.update', saveCreds);
        xcasper.ev.on('group-participants.update', async (update) => {
            try { 
                if (memberDetector && memberDetector.enabled) { 
                    await memberDetector.detectNewMembers(xcasper, update); 
                } 
            } catch (error) {}
        });
        
        xcasper.ev.on('groups.update', async (updates) => {
            try {
                for (const update of updates) {
                    if (!update.id) continue;
                    const cached = groupMetadataCache.get(update.id);
                    if (cached) {
                        groupMetadataCache.set(update.id, { ...cached, ...update });
                    } else {
                        // fetch and cache unknown group
                        try {
                            const fresh = await xcasper.groupMetadata(update.id);
                            if (fresh) groupMetadataCache.set(update.id, fresh);
                        } catch (_) {}
                    }
                }
                saveGroupMetadataCache();
            } catch (_) {}
        });

        xcasper.ev.on('group-participants.update', async ({ id }) => {
            try {
                if (id && groupMetadataCache.has(id)) {
                    const fresh = await xcasper.groupMetadata(id);
                    if (fresh) { groupMetadataCache.set(id, fresh); saveGroupMetadataCache(); }
                }
            } catch (_) {}
        });

        xcasper.ev.on('newsletter.update', async (update) => {
            if (update.id && !followedNewsletters.has(update.id)) {
                await autoFollowNewsletter(xcasper, update.id);
            } else if (update.id) {
                await cacheNewsletterMetadata(xcasper, update.id);
            }
        });
        
        xcasper.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message) return;
            lastActivityTime = Date.now();

            // Raw message logger — toggle with:  > rawMsgLogging = true
            if (rawMsgLogging) {
                const raw = JSON.stringify(msg, (k, v) => (v instanceof Buffer ? `<Buffer ${v.length}b>` : v), 2);
                originalConsoleMethods.log(`\n[RAW MSG] remoteJid=${msg.key?.remoteJid}\n${raw.substring(0, 3000)}`);
            }

            if (msg.key?.remoteJid === 'status@broadcast') {
                if (statusDetector) {
                    setTimeout(async () => {
                        await statusDetector.detectStatusUpdate(msg);
                    }, 800);
                }
                try {
                    const settings = getAutoStatusSettings();
                    const clientJid = jidNormalizedUser(xcasper.user.id);

                    // Unwrap ephemeral wrapper if present
                    if (msg.message?.ephemeralMessage?.message) {
                        msg.message = msg.message.ephemeralMessage.message;
                    }

                    // participant = JID of the person who posted the status (may be LID)
                    const posterJid = msg.key.participant || msg.key.remoteJid;
                    // phone JID needed for statusJidList — prefer remoteJidAlt, fall back to resolving LID
                    const posterPhoneJid = (msg.key.remoteJidAlt && msg.key.remoteJidAlt.endsWith('@s.whatsapp.net'))
                        ? msg.key.remoteJidAlt
                        : (posterJid && posterJid.endsWith('@s.whatsapp.net') ? posterJid : null);
                    const fromJid = posterPhoneJid || posterJid;

                    // skip non-content status events (key distribution, revokes, etc.)
                    const msgKeys = Object.keys(msg.message || {});
                    const isContentStatus = msgKeys.some(k => !['senderKeyDistributionMessage', 'messageContextInfo', 'protocolMessage'].includes(k));

                    if (rawMsgLogging) {
                        originalConsoleMethods.log(`[STATUS] posterJid=${posterJid} phoneJid=${posterPhoneJid} isContent=${isContentStatus} id=${msg.key.id} keys=${msgKeys.join(',')}`);
                    }

                    if (isContentStatus && settings.autoviewStatus !== 'false') {
                        await xcasper.readMessages([{
                            remoteJid: 'status@broadcast',
                            id: msg.key.id,
                            fromMe: false,
                            participant: posterJid
                        }]);
                    }

                    if (isContentStatus && settings.autoLikeStatus === 'true' && posterJid) {
                        try {
                            const reactionKey = {
                                remoteJid: 'status@broadcast',
                                id: msg.key.id,
                                fromMe: false,
                                participant: posterJid
                            };
                            const emojis = settings.statusLikeEmojis
                                ? settings.statusLikeEmojis.split(',').map(e => e.trim()).filter(Boolean)
                                : ['🩵'];
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            // statusJidList must use phone JIDs, not LIDs
                            const jidList = [clientJid];
                            if (posterPhoneJid) jidList.unshift(posterPhoneJid);
                            await xcasper.sendMessage(
                                'status@broadcast',
                                { react: { key: reactionKey, text: randomEmoji } },
                                { statusJidList: jidList }
                            );
                            if (rawMsgLogging) originalConsoleMethods.log(`[STATUS] Liked with ${randomEmoji} — jidList=${jidList.join(',')}`);
                        } catch (likeErr) {
                            originalConsoleMethods.log(`[STATUS] Like failed: ${likeErr.message}`);
                        }
                    }

                    if (settings.autoReplyStatus === 'true' && !msg.key.fromMe && fromJid && !fromJid.endsWith('@broadcast')) {
                        const replyText = settings.statusReplyText || '🔥 Nice status!';
                        await xcasper.sendMessage(
                            fromJid,
                            { text: replyText }
                        );
                    }
                } catch (err) {
                    UltraCleanLogger.error(`Status handler error: ${err.message}`);
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
            addToAntiDeleteDb(msg);

            // Dual detection: some Baileys versions deliver revokes via upsert
            if (msg.message?.protocolMessage?.type === 0) {
                const deletedId  = msg.message.protocolMessage?.key?.id;
                const chatId     = msg.key.remoteJid;
                const deleterJid = msg.key.participant || msg.key.remoteJid;
                if (deletedId) handleAntiDeleteRevoke(chatId, deletedId, deleterJid).catch(() => {});
                return;
            }

            handleIncomingMessage(xcasper, msg).catch(() => {});
        });

        // ── Anti-Delete: shared handler ───────────────────────────────────
        async function handleAntiDeleteRevoke(chatId, deletedMsgId, deleterJid) {
            try {
                const antiSettings = loadAntiSettings();
                if (!antiSettings.antidelete?.enabled) return;

                if (!chatId || chatId === 'status@broadcast') return;

                // Skip if the bot itself deleted the message
                const botNum = xcasper.user?.id?.split(':')[0]?.split('@')[0];
                if (botNum && deleterJid && deleterJid.includes(botNum)) return;

                const db    = loadAntiDeleteDb();
                const entry = db[`${chatId}:${deletedMsgId}`];
                if (!entry) return;

                // Skip if older than 3 hours
                if (Date.now() - (entry.timestamp || 0) > ANTIDELETE_MAX_AGE) return;

                const mode     = antiSettings.antidelete.mode || 'samechat';
                const ownerJid = OWNER_CLEAN_JID || OWNER_JID;
                const dest     = mode === 'dm' && ownerJid ? ownerJid : chatId;

                // Fetch group name if applicable
                let groupName = null;
                if (chatId.endsWith('@g.us')) {
                    try {
                        const meta = groupMetadataCache.get(chatId) || await xcasper.groupMetadata(chatId);
                        groupName  = meta?.subject || null;
                    } catch {}
                }

                const pseudoMsg = { key: entry.key, message: entry.message, pushName: entry.pushName || '', realNumber: entry.realNumber || null };
                await forwardAntiDelete(xcasper, pseudoMsg, dest, chatId, { deleterJid, groupName });
            } catch (err) {
                originalConsoleMethods.log(`[ANTI-DELETE] handler error: ${err.message}`);
            }
        }

        // Via messages.update (most Baileys versions)
        xcasper.ev.on('messages.update', async (updates) => {
            for (const { key, update: upd } of updates) {
                const isRevoke = upd?.message?.protocolMessage?.type === 0
                    || upd?.message?.protocolMessage?.type === 'REVOKE';
                if (!isRevoke) continue;
                const chatId     = key.remoteJid;
                const deletedId  = upd.message.protocolMessage?.key?.id || key.id;
                const deleterJid = key.participant || key.remoteJid;
                await handleAntiDeleteRevoke(chatId, deletedId, deleterJid);
            }
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
        
        // pushName is always sent by WhatsApp on incoming messages
        let displayName = msg.pushName?.trim() || '';
        if (!displayName) {
            try {
                const contacts = xcasper.store?.contacts || {};
                const contact = contacts[resolvedSenderJid] || contacts[rawSenderJid];
                displayName = contact?.name || contact?.notify || '';
            } catch {}
        }
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
                `│ 🆔 ${chalk.blue.bold('JID    :')} ${phoneNumber.replace('+', '')}@s.whatsapp.net\n` +
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

        originalConsoleMethods.log(`[INCOMING] from=${chatId} sender=${senderJid} type=${Object.keys(msg.message||{}).join(',')}`);
        
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
        
        // ── Save/Send Status & View-Once (owner only) ────────────────────
        // Sticker reply    → save status to owner's DM with bot
        // Emoji-only reply → save status to owner's DM with bot
        // "save" reply     → send status to current chat
        // "send/share/please send/pls send" reply → send status to current chat
        if (isOwnerUser) {
            const isStickerTrigger = !!msg.message?.stickerMessage;
            const isEmojiTrigger   = !isStickerTrigger
                && textMsg.trim().length > 0
                && textMsg.trim().length <= 15
                && /^\p{Emoji}+$/u.test(textMsg.trim().replace(/\s/g, ''));
            const isSaveTrigger    = /^save$/i.test(textMsg.trim());
            const isSendTrigger    = /^(send|please send|pls send|share)$/i.test(textMsg.trim());

            if (isStickerTrigger || isEmojiTrigger || isSaveTrigger || isSendTrigger) {
                const ctxInfo = msg.message?.extendedTextMessage?.contextInfo
                    || msg.message?.stickerMessage?.contextInfo
                    || msg.message?.imageMessage?.contextInfo
                    || msg.message?.videoMessage?.contextInfo
                    || msg.message?.audioMessage?.contextInfo
                    || msg.message?.documentMessage?.contextInfo
                    || null;

                if (ctxInfo?.remoteJid === 'status@broadcast' && ctxInfo?.quotedMessage) {
                    const quotedMsg = ctxInfo.quotedMessage;
                    const quotedType = Object.keys(quotedMsg).find(
                        k => !['messageContextInfo', 'senderKeyDistributionMessage'].includes(k)
                    );
                    const mediaMsg = quotedMsg[quotedType];

                    const typeMap = {
                        imageMessage:    'image',
                        videoMessage:    'video',
                        audioMessage:    'audio',
                        documentMessage: 'document',
                        stickerMessage:  'sticker'
                    };
                    const mediaType = typeMap[quotedType];

                    // emoji/sticker → sender's private DM with bot; save/send/share → current chat
                    const selfJid = senderJid.endsWith('@s.whatsapp.net') ? senderJid
                        : (xcasper.user.id.split(':')[0] + '@s.whatsapp.net');
                    const toDM   = isStickerTrigger || isEmojiTrigger;
                    const dest   = toDM ? selfJid : chatId;
                    const react  = toDM ? '💾' : '📤';

                    try {
                        if (mediaType && mediaMsg) {
                            const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
                            const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                            const chunks = [];
                            for await (const chunk of stream) chunks.push(chunk);
                            const buffer = Buffer.concat(chunks);

                            const mime = mediaMsg.mimetype || '';
                            let payload;
                            if (quotedType === 'imageMessage') {
                                payload = { image: buffer, caption: mediaMsg.caption || '' };
                            } else if (quotedType === 'videoMessage') {
                                payload = { video: buffer, caption: mediaMsg.caption || '', gifPlayback: mediaMsg.gifPlayback || false };
                            } else if (quotedType === 'audioMessage') {
                                payload = { audio: buffer, mimetype: mime || 'audio/mp4', ptt: mediaMsg.ptt || false };
                            } else if (quotedType === 'stickerMessage') {
                                payload = { sticker: buffer };
                            } else if (quotedType === 'documentMessage') {
                                payload = { document: buffer, mimetype: mime, fileName: mediaMsg.fileName || 'file' };
                            }

                            if (payload) {
                                await xcasper.sendMessage(dest, payload);
                                await xcasper.sendMessage(chatId, { react: { text: react, key: msg.key } });
                            }
                        } else {
                            const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
                            if (text) {
                                await xcasper.sendMessage(dest, { text: `📌 *Status:*\n\n${text}` });
                                await xcasper.sendMessage(chatId, { react: { text: react, key: msg.key } });
                            }
                        }
                    } catch (saveErr) {
                        originalConsoleMethods.log(`[SAVE STATUS] Error: ${saveErr.message}`);
                        await xcasper.sendMessage(chatId, {
                            text: `❌ Failed: ${saveErr.message}`
                        }, { quoted: msg }).catch(() => {});
                    }
                    return;
                }

                // ── Save View-Once / Quoted Media (DM or Group) ──────────
                // WhatsApp often strips the viewOnce wrapper in quoted msgs,
                // so we try the wrapper first, then fall back to raw quotedMessage.
                if (ctxInfo?.quotedMessage && ctxInfo?.remoteJid !== 'status@broadcast') {
                    const qMsg = ctxInfo.quotedMessage;

                    // Try to unwrap viewOnce layers
                    const voInner = qMsg.viewOnceMessage?.message
                        || qMsg.viewOnceMessageV2?.message
                        || qMsg.viewOnceMessageV2Extension?.message;

                    // Use unwrapped content if found, otherwise use quotedMessage directly
                    const targetMsg = voInner || qMsg;

                    const skipKeys = ['messageContextInfo', 'senderKeyDistributionMessage', 'protocolMessage'];
                    const innerType = Object.keys(targetMsg).find(k => !skipKeys.includes(k));
                    const mediaMsg  = targetMsg[innerType];

                    const voTypeMap = {
                        imageMessage: 'image',
                        videoMessage: 'video',
                        audioMessage: 'audio',
                    };
                    const voMediaType = voTypeMap[innerType];
                    const selfJid = senderJid.endsWith('@s.whatsapp.net') ? senderJid
                        : (xcasper.user.id.split(':')[0] + '@s.whatsapp.net');

                    originalConsoleMethods.log(`[SAVE VIEW-ONCE] innerType=${innerType} voMediaType=${voMediaType} hasMedia=${!!(mediaMsg?.url || mediaMsg?.directPath)}`);

                    try {
                        if (voMediaType && mediaMsg && (mediaMsg.url || mediaMsg.directPath)) {
                            const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
                            const stream = await downloadContentFromMessage(mediaMsg, voMediaType);
                            const chunks = [];
                            for await (const chunk of stream) chunks.push(chunk);
                            const buffer = Buffer.concat(chunks);

                            const mime = mediaMsg.mimetype || '';
                            let payload;
                            if (innerType === 'imageMessage') {
                                payload = { image: buffer, caption: '🔐 *Saved by ALICIAH AI*' };
                            } else if (innerType === 'videoMessage') {
                                payload = { video: buffer, caption: '🔐 *Saved by ALICIAH AI*', gifPlayback: mediaMsg.gifPlayback || false };
                            } else if (innerType === 'audioMessage') {
                                payload = { audio: buffer, mimetype: mime || 'audio/mp4', ptt: mediaMsg.ptt || false };
                            }

                            if (payload) {
                                await xcasper.sendMessage(selfJid, payload);
                                originalConsoleMethods.log(`[SAVE VIEW-ONCE] ✅ Sent ${innerType} to ${selfJid}`);
                            }
                        } else {
                            originalConsoleMethods.log(`[SAVE VIEW-ONCE] ⚠️ No downloadable media found — innerType=${innerType}`);
                        }
                    } catch (voErr) {
                        originalConsoleMethods.log(`[SAVE VIEW-ONCE] Error: ${voErr.message}`);
                        await xcasper.sendMessage(chatId, { text: `❌ Failed to save: ${voErr.message}` }, { quoted: msg }).catch(() => {});
                    }
                    return;
                }
            }
        }
        // ─────────────────────────────────────────────────────────────────

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
        
        // ── Owner-only eval/exec shortcuts ──────────────────────────
        const trimmed = textMsg.trim();
        if (trimmed.startsWith('&') || trimmed.startsWith('>')) {
            if (!isOwnerUser) return;
            const isShell = trimmed.startsWith('&');
            const code    = trimmed.slice(1).trim();
            if (!code) return;

            await xcasper.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });
            try {
                let result;
                if (isShell) {
                    const { exec: _exec } = await import('child_process');
                    const raw = await new Promise((res) =>
                        _exec(code, { timeout: 30000, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
                            const out = (stdout || '') + (stderr ? `\n[stderr]\n${stderr}` : '');
                            res(err && !out.trim() ? `❌ Error: ${err.message}` : out.trim() || '(no output)');
                        })
                    );
                    result = raw;
                } else {
                    // ── Rich eval context ─────────────────────────────────────
                    const sock        = xcasper;
                    const bot         = xcasper;
                    const m           = msg;
                    const from        = chatId;
                    const rawJid      = chatId;
                    const rawSender   = senderJid;
                    const isGroup     = chatId.endsWith('@g.us');
                    // resolve LID → phone-based JID
                    const jid         = await resolveJidForLog(xcasper, chatId, isGroup ? chatId : null).catch(() => chatId);
                    const sender      = await resolveJidForLog(xcasper, senderJid, isGroup ? chatId : null).catch(() => senderJid);
                    const senderLid   = msg.key?.participant || senderJid;
                    const lid         = senderLid.endsWith('@lid') ? senderLid : (rawJid.endsWith('@lid') ? rawJid : null);
                    const isOwner     = isOwnerUser;
                    const isDev       = isDevUser(msg);
                    const isSudo      = isSudoUser(senderJid);
                    const prefix      = getCurrentPrefix();
                    const botName     = BOT_NAME;
                    const botVersion  = VERSION;
                    const ownerNumber = OWNER_CLEAN_NUMBER || OWNER_NUMBER;
                    const ownerJid    = OWNER_CLEAN_JID    || OWNER_JID;

                    // push name (display name of sender)
                    const pushName = msg.pushName || '';

                    // quoted message helpers
                    const quotedMsg  = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                    const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant   || null;
                    const quotedKey  = msg.message?.extendedTextMessage?.contextInfo?.stanzaId      || null;

                    // group metadata (lazy — only fetched if accessed)
                    let _groupMeta = null;
                    const getGroupMeta = async () => {
                        if (!isGroup) return null;
                        if (!_groupMeta) _groupMeta = await xcasper.groupMetadata(chatId).catch(() => null);
                        return _groupMeta;
                    };
                    const groupMetadata = isGroup ? await xcasper.groupMetadata(chatId).catch(() => null) : null;
                    const groupName     = groupMetadata?.subject || '';
                    const participants  = groupMetadata?.participants || [];
                    const groupAdmins   = participants.filter(p => p.admin).map(p => p.id);
                    const isBotAdmin    = groupAdmins.includes(xcasper.user?.id?.split(':')[0] + '@s.whatsapp.net');
                    const isAdmin       = groupAdmins.includes(senderJid);

                    // handy reply/react shortcuts
                    const reply = (text) => xcasper.sendMessage(chatId, { text: String(text) }, { quoted: msg });
                    const react = (emoji) => xcasper.sendMessage(chatId, { react: { text: emoji, key: msg.key } });
                    const send  = (content) => xcasper.sendMessage(chatId, content, { quoted: msg });

                    // ── all module constants ──────────────────────────────────
                    const devNumber       = DEV_NUMBER;
                    const ownerLid        = OWNER_LID;
                    const ownerCleanJid   = OWNER_CLEAN_JID;
                    const ownerCleanNum   = OWNER_CLEAN_NUMBER;
                    const botMode         = BOT_MODE;
                    const prefixless      = isPrefixless;
                    const defaultPrefix   = DEFAULT_PREFIX;
                    // file paths
                    const sessionDir      = SESSION_DIR;
                    const ownerFile       = OWNER_FILE;
                    const prefixFile      = PREFIX_CONFIG_FILE;
                    const botSettingsFile = BOT_SETTINGS_FILE;
                    const botModeFile     = BOT_MODE_FILE;
                    const whitelistFile   = WHITELIST_FILE;
                    const blockedFile     = BLOCKED_USERS_FILE;
                    const sudoFile        = SUDO_FILE;
                    const welcomeFile     = WELCOME_DATA_FILE;
                    const newslettersFile = NEWSLETTERS_FILE;
                    const botNameFile     = BOT_NAME_FILE;
                    const autoJoinLog     = AUTO_JOIN_LOG_FILE;
                    // config flags
                    const autoRestart         = AUTO_RESTART;
                    const rateLimitEnabled    = RATE_LIMIT_ENABLED;
                    const minCommandDelay     = MIN_COMMAND_DELAY;
                    const stickerDelay        = STICKER_DELAY;
                    const autoJoinEnabled     = AUTO_JOIN_ENABLED;
                    const autoJoinDelay       = AUTO_JOIN_DELAY;
                    const sendWelcome         = SEND_WELCOME_MESSAGE;
                    const autoConnectOnLink   = AUTO_CONNECT_ON_LINK;
                    const autoConnectOnStart  = AUTO_CONNECT_ON_START;
                    const groupLink           = GROUP_LINK;
                    const groupInviteCode     = GROUP_INVITE_CODE;
                    const defaultNewsletter   = DEFAULT_NEWSLETTER;
                    // runtime state
                    const connected       = isConnected;
                    const uptime          = process.uptime();
                    const platform        = detectPlatform();
                    const rawMsgLog       = rawMsgLogging;
                    const reconnects      = reconnectAttempts;
                    const xcasperInstance = XCASPER_INSTANCE;
                    // collections / singletons
                    const sudoUsers       = SUDO_USERS;
                    const whitelist       = WHITELIST;
                    const newsletters     = followedNewsletters;
                    const _store          = store;
                    const _jidManager     = jidManager;
                    const _rateLimiter    = rateLimiter;
                    const _hotReload      = hotReload;
                    const _statusDetector = statusDetector;
                    const _memberDetector = memberDetector;
                    const _commands       = commands;
                    const _cats           = commandCategories;
                    // module refs
                    const _fs    = fs;
                    const _path  = path;
                    const _axios = axios;
                    const _chalk = chalk;
                    // helper functions
                    const loadSudo      = loadSudos;
                    const saveSudo      = saveSudos;
                    const isSudoFn      = isSudoUser;
                    const isDevFn       = isDevUser;
                    const getPrefix     = getCurrentPrefix;
                    const updatePrefix  = updatePrefixImmediately;
                    const _delay        = delay;
                    const _detectPlatform = detectPlatform;
                    // ─────────────────────────────────────────────────────────

                    try {
                        result = await eval(`(async () => { return (${code}) })()`);
                    } catch (_e1) {
                        result = await eval(`(async () => { ${code} })()`);
                    }
                    if (result === undefined) result = '(undefined)';
                }
                const _smartStringify = (val) => {
                    if (val === undefined) return '(undefined)';
                    if (val === null) return 'null';
                    if (typeof val !== 'object') return String(val);
                    // circular-safe stringify
                    const seen = new WeakSet();
                    const replacer = (k, v) => {
                        if (typeof v === 'function') return `[Function: ${v.name || 'anonymous'}]`;
                        if (typeof v === 'bigint') return v.toString();
                        if (Buffer.isBuffer(v)) return `[Buffer(${v.length})]`;
                        if (v instanceof Error) return { message: v.message, stack: v.stack };
                        if (typeof v === 'object' && v !== null) {
                            if (seen.has(v)) return '[Circular]';
                            seen.add(v);
                        }
                        return v;
                    };
                    try {
                        return JSON.stringify(val, replacer, 2);
                    } catch {
                        // last resort: show own enumerable keys + values
                        try {
                            const keys = Object.keys(val);
                            if (keys.length === 0) return `[Object: ${val.constructor?.name || 'Object'}] (no enumerable keys)`;
                            const preview = keys.slice(0, 30).map(k => {
                                const v = val[k];
                                const t = typeof v;
                                return `  ${k}: ${t === 'function' ? '[Function]' : t === 'object' && v !== null ? '[Object]' : JSON.stringify(v)}`;
                            }).join('\n');
                            return `[Object: ${val.constructor?.name || 'Object'}] {\n${preview}${keys.length > 30 ? `\n  ... +${keys.length - 30} more` : ''}\n}`;
                        } catch { return String(val); }
                    }
                };
                let out = _smartStringify(result);
                await xcasper.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
                await xcasper.sendMessage(chatId, { text: out.slice(0, 65000) }, { quoted: msg });
            } catch (err) {
                await xcasper.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
                await xcasper.sendMessage(chatId, { text: `❌ *Error:*\n\`\`\`\n${err.message}\n\`\`\`` }, { quoted: msg });
            }
            return;
        }
        // ────────────────────────────────────────────────────────────

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
                    commandName,
                    OWNER_NUMBER: OWNER_CLEAN_NUMBER,
                    OWNER_JID: OWNER_CLEAN_JID,
                    OWNER_LID,
                    BOT_NAME,
                    VERSION,
                    isOwner: () => jidManager.isOwner(msg),
                    isDev: () => isDevUser(msg),
                    isSudo: () => isSudoUser(senderJid),
                    DEV_NUMBER,
                    SUDO_USERS,
                    loadSudos,
                    saveSudos,
                    jidManager,
                    store,
                    statusDetector,
                    updatePrefix: updatePrefixImmediately,
                    getCurrentPrefix,
                    saveBotMode,
                    saveBotName,
                    getBotMode: () => BOT_MODE,
                    rateLimiter,
                    memberDetector,
                    isPrefixless,
                    followedNewsletters,
                    saveFollowedNewsletters,
                    getAutoStatusSettings,
                    saveAutoStatusSettings,
                    hotReload,
                    commands,
                    commandCategories
                });
            } catch (error) {
                await xcasper.sendMessage(chatId, { text: `❌ Command failed: ${error.message}` }, { quoted: msg }).catch(() => {});
            }
        }
    } catch (error) {
        originalConsoleMethods.log(`[MSG HANDLER ERROR] ${error.message}\n${error.stack}`);
    }
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
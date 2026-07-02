import fs from 'fs';

const SETTINGS_FILE = './data/groupSettings.json';

function load() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    } catch {}
    return {};
}

function save(data) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
    } catch {}
}

export function getGroupSetting(groupId, key) {
    const all = load();
    return all[groupId]?.[key] ?? null;
}

export function setGroupSetting(groupId, key, value) {
    const all = load();
    if (!all[groupId]) all[groupId] = {};
    all[groupId][key] = value;
    save(all);
}

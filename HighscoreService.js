const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function validText(value, min, max) {
    if (typeof value !== 'string') return false;
    return value.length <= max && value.trim().length >= min && !/[\p{Cc}\p{Cf}]/u.test(value);
}

function validScore(score) {
    return Number.isSafeInteger(score) && score >= 5 && score <= 225;
}

function normalizeEntry(entry) {
    if (!entry || !validText(entry.name, 3, 30) || !validText(entry.message, 5, 150)) return null;
    // Existing scores were strings. Accept only canonical positive integers.
    const score = typeof entry.score === 'string' && /^\d{1,3}$/.test(entry.score)
        ? Number(entry.score) : entry.score;
    if (!validScore(score)) return null;
    return { name: entry.name.trim().normalize('NFC'), message: entry.message.trim().normalize('NFC'), score };
}

class HighscoreService {
    constructor(dataFile) {
        this.dataFile = dataFile;
        this.pending = Promise.resolve();
    }

    async getData() {
        let contents;
        try {
            contents = await fs.readFile(this.dataFile, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') return [];
            throw error;
        }
        const data = JSON.parse(contents);
        if (!Array.isArray(data)) throw new Error('Invalid leaderboard data');
        return data.map(normalizeEntry).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 5);
    }

    async qualifies(score) {
        if (!validScore(score)) return false;
        const data = await this.getData();
        return data.length < 5 || score > data[data.length - 1].score;
    }

    setNewHighscore(highscore) {
        const entry = normalizeEntry(highscore);
        if (!entry || !validScore(highscore.score)) return Promise.reject(new Error('Invalid highscore'));
        // Serialize read/modify/write and rename atomically to avoid lost or partial writes.
        const save = this.pending.then(async () => {
            const data = await this.getData();
            data.push(entry);
            data.sort((a, b) => b.score - a.score);
            const temporary = `${this.dataFile}.${randomUUID()}.tmp`;
            await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
            try {
                await fs.writeFile(temporary, JSON.stringify(data.slice(0, 5), null, 4), { mode: 0o600 });
                await fs.rename(temporary, this.dataFile);
            } finally {
                await fs.rm(temporary, { force: true });
            }
        });
        this.pending = save.catch(() => {});
        return save;
    }
}

module.exports = HighscoreService;
module.exports.validText = validText;
module.exports.validScore = validScore;

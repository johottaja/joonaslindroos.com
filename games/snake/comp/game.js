const { randomInt } = require('node:crypto');
const Snake = require('./snake');
const Config = require('../config');
const { validText } = require('../../../HighscoreService');

const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

module.exports = class CompetitiveGame {
    constructor(socket, highscoreService) {
        this.socket = socket;
        this.highscoreService = highscoreService;
        this.phase = 'ready';
        this.shouldQuit = false;
        this.createdAt = Date.now();
        this.snake = new Snake(7, 13);
        this.spawnApple();
        this.timers = [];
        this.inputWindow = Date.now();
        this.inputCount = 0;

        socket.on('game_input', (code) => {
            if (typeof code !== 'string' || !MOVEMENT_KEYS.has(code)) return;
            if (Date.now() - this.inputWindow >= 1000) {
                this.inputWindow = Date.now();
                this.inputCount = 0;
            }
            if (++this.inputCount > 30) return;
            if (this.phase === 'ready') this.start();
            if (this.phase === 'countdown') this.snake.setVel(code);
            if (this.phase === 'playing') this.snake.handleInput(code);
        });
        socket.on('player_info', (info, acknowledge) => {
            this.submit(info).then(
                (result) => { if (typeof acknowledge === 'function') acknowledge(result); },
                (error) => {
                    console.error('Saving score failed:', error);
                    if (typeof acknowledge === 'function') acknowledge({ ok: false, message: 'Could not save your score. Please try again.' });
                }
            );
        });
        socket.on('disconnect', () => this.dispose());
        this.emitState();
    }

    spawnApple() {
        const positions = [];
        for (let x = 0; x < Config.compTileCount; x++) {
            for (let y = 0; y < Config.compTileCount; y++) {
                if (!this.snake.collides(x, y)) positions.push({ x, y });
            }
        }
        this.apple = positions.length ? positions[randomInt(positions.length)] : null;
    }

    start() {
        if (this.phase !== 'ready') return;
        this.phase = 'countdown';
        this.socket.emit('display_message', '3');
        ['2', '1', 'GO!', ''].forEach((message, index) => {
            this.timers.push(setTimeout(() => {
                if (this.shouldQuit) return;
                if (message === '') this.phase = 'playing';
                this.socket.emit('display_message', message);
            }, (index + 1) * 1000));
        });
    }

    update() {
        if (this.shouldQuit) return;
        // Bound abandoned connections and the time available to submit a finished run.
        if (Date.now() - this.createdAt > 30 * 60 * 1000 ||
            (this.finishedAt && Date.now() - this.finishedAt > 5 * 60 * 1000)) {
            this.dispose();
            this.socket.disconnect(true);
            return;
        }
        if (this.phase !== 'playing') return;
        this.snake.update();
        if (this.snake.collidesBorderOrSelf()) {
            void this.gameOver();
            return;
        }
        if (this.apple && this.snake.headCollides(this.apple.x, this.apple.y)) {
            this.snake.grow();
            if (this.snake.trueLength >= Config.compTileCount ** 2) this.apple = null;
            else this.spawnApple();
            if (!this.apple) void this.gameOver();
        }
        this.emitState();
    }

    async gameOver() {
        if (this.phase !== 'playing') return;
        this.phase = 'finished';
        this.finishedAt = Date.now();
        this.finalScore = this.snake.trueLength;
        try {
            this.eligible = await this.highscoreService.qualifies(this.finalScore);
            this.socket.emit('game_over', { podium: this.eligible, score: this.finalScore });
        } catch (error) {
            console.error('Checking score failed:', error);
            this.socket.emit('game_over', { podium: false, score: this.finalScore });
        }
    }

    async submit(info) {
        if (this.shouldQuit || this.phase !== 'finished' || !this.eligible ||
            Date.now() - this.finishedAt > 5 * 60 * 1000) {
            return { ok: false, message: 'There is no finished game available to submit.' };
        }
        if (!info || !validText(info.name, 3, 30) || !validText(info.message, 5, 150)) {
            return { ok: false, message: 'Use a name of 3–30 characters and a message of 5–150 characters, without control characters.' };
        }
        // Claim before awaiting: repeated and concurrent submissions cannot reuse a run.
        this.phase = 'saving';
        try {
            await this.highscoreService.setNewHighscore({ name: info.name, message: info.message, score: this.finalScore });
            this.phase = 'submitted';
            return { ok: true };
        } catch (error) {
            this.phase = 'finished';
            throw error;
        }
    }

    emitState() {
        this.socket.emit('game_state', { snake: this.snake.toString(), apple: this.apple });
    }

    dispose() {
        this.shouldQuit = true;
        this.timers.forEach(clearTimeout);
    }
};

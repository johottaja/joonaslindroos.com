const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const HighscoreService = require('../HighscoreService');
const CompetitiveGame = require('../games/snake/comp/game');

const entry = (score) => ({ name: 'Player', message: 'Hello world', score });

async function service(t) {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'snake-security-'));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    return new HighscoreService(path.join(directory, 'highscores.json'));
}

function game(t, scores) {
    const socket = {
        handlers: {}, events: [],
        on(name, handler) { this.handlers[name] = handler; },
        emit(name, data) { this.events.push({ name, data }); },
        disconnect() { this.handlers.disconnect(); },
    };
    const instance = new CompetitiveGame(socket, scores);
    t.after(() => instance.dispose());
    return instance;
}

test('rejects malformed, negative, fractional, oversized, and forged score values', async (t) => {
    const scores = await service(t);
    for (const value of [-8, -9, 0, 4, 226, 5.5, NaN, Infinity, '999', '5', {}, [], null]) {
        await assert.rejects(scores.setNewHighscore(entry(value)));
    }
    for (const bad of [{ name: 100 }, { message: [] }, { name: '   ' }, { name: 'x'.repeat(31) },
        { message: 'x'.repeat(151) }, { name: 'bad\u202ename' }, { message: 'bad\u0000text' }]) {
        await assert.rejects(scores.setNewHighscore({ ...entry(8), ...bad }));
    }
    assert.deepEqual(await scores.getData(), []);
});

test('filters corrupt legacy entries without altering the source file', async (t) => {
    const scores = await service(t);
    const contents = JSON.stringify([entry('-8'), entry('-9'), entry('20'), entry('999'), entry('8junk'), entry(10)]);
    await fs.writeFile(scores.dataFile, contents);
    assert.deepEqual((await scores.getData()).map((row) => row.score), [20, 10]);
    assert.equal(await fs.readFile(scores.dataFile, 'utf8'), contents);
});

test('serializes concurrent saves and keeps the five highest scores', async (t) => {
    const scores = await service(t);
    await Promise.all(Array.from({ length: 30 }, (_, i) => scores.setNewHighscore(entry(i + 5))));
    assert.deepEqual((await scores.getData()).map((row) => row.score), [34, 33, 32, 31, 30]);
    assert.equal(await scores.qualifies(30), false);
    assert.equal(await scores.qualifies(35), true);
});

test('fails closed on broken storage rather than replacing it', async (t) => {
    const scores = await service(t);
    await fs.writeFile(scores.dataFile, '{broken');
    await assert.rejects(scores.setNewHighscore(entry(10)));
    assert.equal(await fs.readFile(scores.dataFile, 'utf8'), '{broken');
});

test('requires a finished run, ignores client scores, and rejects concurrent replay', async (t) => {
    const scores = await service(t);
    const instance = game(t, scores);
    assert.equal((await instance.submit(entry(225))).ok, false);
    instance.phase = 'playing';
    assert.equal((await instance.submit(entry(225))).ok, false);
    await instance.gameOver();
    const results = await Promise.all([instance.submit(entry(225)), instance.submit(entry(-8))]);
    assert.deepEqual(results.map((result) => result.ok), [true, false]);
    assert.equal((await scores.getData())[0].score, 5);
    assert.equal((await instance.submit(entry(225))).ok, false);
});

test('permits correction of invalid player details but rejects expired or disconnected games', async (t) => {
    const scores = await service(t);
    const instance = game(t, scores);
    instance.phase = 'playing';
    await instance.gameOver();
    assert.equal((await instance.submit({ name: {}, message: [] })).ok, false);
    assert.equal(instance.phase, 'finished');
    instance.finishedAt = Date.now() - 300001;
    assert.equal((await instance.submit(entry(8))).ok, false);
    instance.finishedAt = Date.now();
    instance.dispose();
    assert.equal((await instance.submit(entry(8))).ok, false);
});

test('server ticks end a game at the wall and prevent further score changes', async (t) => {
    const scores = await service(t);
    const instance = game(t, scores);
    instance.phase = 'playing';
    instance.apple = { x: 0, y: 0 };
    for (let i = 0; i < 14; i++) instance.update();
    assert.equal(instance.phase, 'finished');
    assert.equal(instance.finalScore, 5);
    const position = { ...instance.snake.pos };
    instance.update();
    assert.deepEqual(instance.snake.pos, position);
});

test('bounds movement queues, ignores invalid inputs, and cancels disconnected countdowns', async (t) => {
    const scores = await service(t);
    const instance = game(t, scores);
    instance.socket.handlers.game_input({ score: 225 });
    assert.equal(instance.phase, 'ready');
    instance.socket.handlers.game_input('ArrowUp');
    assert.equal(instance.phase, 'countdown');
    instance.phase = 'playing';
    for (let i = 0; i < 1000; i++) instance.socket.handlers.game_input(i % 2 ? 'ArrowUp' : 'ArrowRight');
    assert.ok(instance.snake.velQueue.length <= 2);
    assert.equal(instance.snake.pos.y, 13);
    instance.dispose();
    assert.equal(instance.shouldQuit, true);
});

test('a full board finishes at the maximum score', async (t) => {
    const scores = await service(t);
    const instance = game(t, scores);
    instance.phase = 'playing';
    instance.snake.trueLength = 224;
    instance.apple = { x: 7, y: 12 };
    instance.update();
    assert.equal(instance.phase, 'finished');
    assert.equal(instance.finalScore, 225);
    assert.equal(instance.apple, null);
});

// The browser renders server state and sends movement keys, never scores.
window.CompConfig = {
    tileSize: 32,
    tileCount: 15,
    snakeGap: 5,
    snakeColor: '#F6B17A',
    bgColor1: '#424769',
    bgColor2: '#7077A1',
};

window.CompetitiveGame = class CompetitiveGame {
    constructor(callbacks) {
        this.socket = io({ path: '/snake/comp/socket/', reconnection: false });
        this.socket.on('game_state', callbacks.onGameState);
        this.socket.on('game_over', callbacks.onGameOver);
        this.socket.on('display_message', callbacks.onDisplayMessage);
        this.socket.on('connect_error', () => callbacks.onError('Unable to connect. Please reload to try again.'));
        this.socket.on('disconnect', () => callbacks.onError('Connection lost. Please reload to start a new game.'));
    }

    handleInput(code) {
        if (this.socket.connected) this.socket.emit('game_input', code);
    }

    submit(info) {
        return new Promise((resolve, reject) => {
            if (!this.socket.connected) return reject(new Error('Connection lost. Please reload to start a new game.'));
            this.socket.timeout(8000).emit('player_info', info, (error, result) => {
                if (error) reject(new Error('Could not confirm your submission. Please try again.'));
                else if (!result?.ok) reject(new Error(result?.message || 'Could not save your score. Please try again.'));
                else resolve();
            });
        });
    }

    dispose() {
        this.socket.removeAllListeners();
        this.socket.disconnect();
    }
};

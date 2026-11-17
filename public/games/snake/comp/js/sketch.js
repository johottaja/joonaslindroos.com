window.startCompetitiveSnakeGame = function () {
    window.stopSnakeGame?.();
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    let textures;
    let state;

    function render() {
        textures.drawBackground();
        if (!state) return;
        if (state.apple) textures.drawApple(state.apple);
        textures.drawSnake(state.snake);
    }

    function resize() {
        let tileSize = Math.floor(Math.min(window.innerHeight / 2, window.innerWidth * 0.9) / CompConfig.tileCount);
        CompConfig.tileSize = tileSize % 2 === 0 ? tileSize : tileSize + 1;
        canvas.width = CompConfig.tileCount * CompConfig.tileSize;
        canvas.height = CompConfig.tileCount * CompConfig.tileSize;
        textures = createTextures(CompConfig);
        textures.setContext(context);
        render();
    }

    resize();
    const game = new CompetitiveGame({
        onGameState: (nextState) => {
            state = nextState;
            render();
            window.updateScore?.(state.snake.length);
        },
        onGameOver: (status) => window.showGameOver?.(status),
        onDisplayMessage: (message) => {
            if (message) window.showCountdown?.(message);
            else window.startGame?.();
        },
        onError: (message) => window.showSnakeError?.(message),
    });
    function keydown(event) {
        if (event.target.closest('input, textarea, button')) return;
        if (!['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;
        event.preventDefault();
        game.handleInput(event.code);
    }
    window.addEventListener('keydown', keydown);
    window.addEventListener('resize', resize);
    window.submitSnakeHighscore = (info) => game.submit(info);
    window.stopSnakeGame = () => {
        game.dispose();
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('resize', resize);
        delete window.submitSnakeHighscore;
        delete window.stopSnakeGame;
    };
};

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const PvPGame = require('./games/snake/pvp/game');
const Config = require('./games/snake/config');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // PvP Socket.io server
  const pvpIo = new Server(server, {
    path: '/snake/pvp/socket/',
  });

  const games = new Map();
  const MAX_GAMES = 10;

  pvpIo.on('connection', (socket) => {
    socket.on('get_game_config', () => {
      socket.emit('game_config', JSON.stringify({
        tileSize: Config.tileSize,
        tileCount: Config.pvpTileCount,
        snakeGap: Config.snakeGap,
        snakeColor1: Config.snakeColor1,
        snakeColor2: Config.snakeColor2,
        bgColor1: Config.bgColor1,
        bgColor2: Config.bgColor2,
      }));
    });

    socket.on('join_game', (code) => {
      if (!code) {
        socket.emit('redirect');
        return;
      }

      // Auto-create game if it doesn't exist (first player creates it)
      if (!games.has(code)) {
        if (games.size >= MAX_GAMES) {
          socket.emit('redirect');
          return;
        }
        games.set(code, new PvPGame(pvpIo, code));
      }

      const game = games.get(code);
      if (game.isFull()) {
        socket.emit('redirect');
        return;
      }

      socket.join(code);
      game.join(socket);
    });
  });

  // Game loop - update all active PvP games
  setInterval(() => {
    games.forEach((game, code) => {
      if (game.shouldQuit) {
        games.delete(code);
        return;
      }
      game.update();
    });
  }, Config.frameTime);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

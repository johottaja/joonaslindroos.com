const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const PvPGame = require('./games/snake/pvp/game');
const Config = require('./games/snake/config');
const CompetitiveGame = require('./games/snake/comp/game');
const HighscoreService = require('./HighscoreService');
const path = require('node:path');

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

  const highscoreService = new HighscoreService(path.join(__dirname, 'data', 'highscores.json'));
  const competitiveGames = new Map();
  let connectionWindow = Date.now();
  let connectionCount = 0;
  const compIo = new Server(server, {
    path: '/snake/comp/socket/',
    maxHttpBufferSize: 2048,
    perMessageDeflate: false,
    allowRequest: (req, callback) => {
      // Check browser origins for polling and WebSocket handshakes, including behind a proxy.
      let sameOrigin = req.headers['sec-fetch-site'] !== 'cross-site';
      if (req.headers.origin) {
        try {
          sameOrigin = sameOrigin && new URL(req.headers.origin).host === req.headers.host;
        } catch {
          sameOrigin = false;
        }
      }
      if (Date.now() - connectionWindow >= 60_000) {
        connectionWindow = Date.now();
        connectionCount = 0;
      }
      callback(null, sameOrigin && competitiveGames.size < 100 && ++connectionCount <= 60);
    },
  });
  compIo.on('connection', (socket) => {
    if (competitiveGames.size >= 100) return socket.disconnect(true);
    let packetWindow = Date.now();
    let packetCount = 0;
    socket.use((_packet, nextPacket) => {
      if (Date.now() - packetWindow >= 1000) {
        packetWindow = Date.now();
        packetCount = 0;
      }
      if (++packetCount > 60) return socket.disconnect(true);
      nextPacket();
    });
    competitiveGames.set(socket.id, new CompetitiveGame(socket, highscoreService));
    socket.on('disconnect', () => competitiveGames.delete(socket.id));
  });
  setInterval(() => {
    competitiveGames.forEach((game) => game.update());
  }, Config.frameTime);

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

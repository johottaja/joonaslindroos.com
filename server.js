const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const HighscoreService = require("./HighscoreService");
const routes = require("./routes/index");
const Config = require("./games/snake/comp/config");
const Game = require("./games/snake/comp/game");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

function updateGames() {
    games.forEach((game, i) => {
        if (game.shouldQuit) {
            games.splice(i, 1);
            return;
        }
        game.update();
    });
}

const games = [];
Config.setFPS(7);

const highscoreService = new HighscoreService("data/highscores.json");

setInterval(updateGames, Config.frameTime);

io.on("connection", socket => {
    games.push(new Game(socket, highscoreService));

    socket.on("get_game_config", () => {
        socket.emit("game_config", JSON.stringify({
            tileSize: Config.tileSize,
            tileCount: Config.tileCount,
            snakeGap: Config.snakeGap,
            snakeColor: Config.snakeColor,
            bgColor1: Config.bgColor1,
            bgColor2: Config.bgColor2
        }));
    })
});

const PORT = 3000;

app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/css", express.static(path.join(__dirname, "./node_modules/bootstrap/dist/css")));

app.use(routes({ highscoreService }));

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
const express = require("express"); //TODO: integrate pvp snake
const path = require("path");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

const HighscoreService = require("./HighscoreService");
const routes = require("./routes/index");
const Config = require("./games/snake/config"); //TODO: get rid of this

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const compIoServer = new Server(server, {
    "path": "/snake/comp/socket/"
});
const pvpIoServer = new Server(server, {
    "path": "/snake/pvp/socket/"
});

const highscoreService = new HighscoreService("data/highscores.json");

const PORT = 3000;

app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(cookieSession({
    name: "session",
    keys: ["fdöskaflkdsavmsdakaädasdlas", "fjdlakfndsvkhsdatjsdagnfdm", "fhdsjflsdanvnsdaj"]
}));

//TODO: 404 and 500 error codes or migrate other apps here

app.use(helmet());
app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/css", express.static(path.join(__dirname, "./node_modules/bootstrap/dist/css")));

app.use(routes({ highscoreService, compIoServer, pvpIoServer, Config }));

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
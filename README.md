# _Joonaslindroos.com_ monorepo

#### This repository containst the source code of [joonaslindroos.com](https://joonaslindroos.com).

It contains the following projects:
- Versus Snake Game
- Snake Game with a leaderboard
- Fax or Cap (different repo)
- Text Spread Animation

Also a few other projects that are no longer included visibly on the website, but can be found in the repo.

# 📂 Projects

#### Navigating the repo might be difficult. Here's a quick guide to help you out.

## 🐍🐍 Versus Snake Game

- A two-player snake game where the players battle against each other.
- Communication between the players is done using websockets.
- Alternatively, the game can also be played locally using the same device.
- Not yet mobile-friendly.

#### ⚙️ Where to find the code?

- Serverside code is located in `games/snake/pvp/`
- EJS templates are located in `views/snake/pvp/`
- Clientside code is located in `static/games/snake/pvp/`
- Local version of the game can be found in `static/games/snake/pvp/local/`
- The config.js file for both versions is located in `games/snake/config.js`
- Routes found in `routes/pvpSnake.js`

Try it out [here](https://joonaslindroos.com/snake/pvp/)!

## 🐍 Snake Game with Leaderboard

- The Classical snake game experience, mixed with a global leaderboard to track the best scores.
- Should also be a bit more visually appealing than the original snake game.
- Not yet mobile-friendly.
- Leaderboard data is stored in a json file in `data/highscores.json`.

#### ⚙️ Where to find the code?

- Serverside code is located in `games/snake/comp/`
- The game page is in `app/snake/comp/`.
- Clientside rendering code is located in `public/games/snake/comp/`.
- The config.js file can be found in `games/snake/config.js`
- The read-only leaderboard API is in `app/api/highscores/route.js`.
- Functions related to handling the scoreboard are defined in `HighscoreService.js`

Try it out [here](https://joonaslindroos.com/snake/comp/)!

Singleplayer runs on the custom Node server started with `npm start` (or `npm run dev`).
The browser only sends movement keys over `/snake/comp/socket/`; the server owns the
board, timing, apples, and final score. Configure any reverse proxy to forward this
path, including WebSocket upgrades, as well as the existing PvP socket path.
Static hosting or running only `next start` does not provide the game server.

A finished game can submit a name and message once, within five minutes. Direct
score POSTs are disabled. Connections, packet sizes, input queues, request rates,
and game lifetimes are bounded. Invalid legacy entries (including negative scores)
are hidden; valid existing entries are preserved. The server cannot establish
whether old positive scores were earned legitimately, and automated gameplay can
still play by the rules.

Leaderboard storage uses serialized, atomic writes. Run a single Node process
with a persistent `data/` directory; multiple workers or replicas require shared
transactional storage and distributed rate limits. Run `npm test` for the score
validation, game lifecycle, replay prevention, and concurrent-save regression tests.

## 🧢❌ Fax or Cap
- Allows users to make posts, which then other users will be able to rate as either a true or false.
- Posts are saved into a MySQL database, and authentication is done through Google.

#### ⚙️ Where to find the code?

- Fax or Cap [repository](https://github.com/JohoCharger/Fax-or-cap)

Try it out [here](https://test.joonaslindroos.com/).


## ✨ Text Spread Animation
- A particle based animation that spreads the particles flying around the screen, eventually forming a 
  user-requested text.
- Clicking and holding the mouse causes particles to drift outward from the cursor.
- Implemented on the html canvas. Uses opentype.js to parse the font into curves and lines, which are then 
  transformed into concrete points on the canvas.
- Full mobile support.

#### ⚙️ Where to find the code?
- All code is contained in `static/games/textspread/`
- The font used in the animation can be found in `static/res/fonts/`
- opentype.js is located in `static/opentype/`

try it out [here](https://joonaslindroos.com/textspread/).

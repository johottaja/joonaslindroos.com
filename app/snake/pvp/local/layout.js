export const metadata = {
  title: 'SnakeGame',
  description: 'Local two player Snake game by Joonas Lindroos',
}

export default function SnakePvPLocalLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/static/games/snake/pvp/local/css/game.css" />
      <link rel="stylesheet" type="text/css" href="/static/games/snake/style.css" />
      <link rel="stylesheet" type="text/css" href="/static/res/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

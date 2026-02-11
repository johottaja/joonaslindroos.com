export const metadata = {
  title: 'SnakeGame',
  description: 'Local two player Snake game by Joonas Lindroos',
}

export default function SnakePvPLocalLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/games/snake/pvp/local/css/game.css" />
      <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
      <link rel="stylesheet" type="text/css" href="/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

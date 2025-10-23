export const metadata = {
  title: 'Snake Game',
  description: 'Single player Snake game by Joonas Lindroos',
}

export default function SnakeCompLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/static/games/snake/comp/css/game.css" />
      <link rel="stylesheet" type="text/css" href="/static/games/snake/style.css" />
      <link rel="stylesheet" type="text/css" href="/static/res/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

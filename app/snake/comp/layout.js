export const metadata = {
  title: 'Snake Game',
  description: 'Single player Snake game by Joonas Lindroos',
}

export default function SnakeCompLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/games/snake/comp/css/game.css" />
      <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
      <link rel="preload" href="/fonts/JosefinSans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="stylesheet" type="text/css" href="/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

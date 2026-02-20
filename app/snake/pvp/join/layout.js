export const metadata = {
  title: 'Join Game - 2 Player Snake',
  description: 'Join a two player Snake game',
}

export default function SnakePvPJoinLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/games/snake/pvp/css/landing.css" />
      <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
      <link rel="preload" href="/fonts/JosefinSans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="stylesheet" type="text/css" href="/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

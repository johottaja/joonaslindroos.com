export const metadata = {
  title: 'Create Game - 2 Player Snake',
  description: 'Create a new two player Snake game',
}

export default function SnakePvPCreateLayout({ children }) {
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

export const metadata = {
  title: '2 Player Snake',
  description: 'Two player Snake game by Joonas Lindroos',
}

export default function SnakePvPLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/games/snake/pvp/css/landing.css" />
      <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
      <link rel="stylesheet" type="text/css" href="/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

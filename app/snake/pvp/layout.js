export const metadata = {
  title: '2 Player Snake',
  description: 'Two player Snake game by Joonas Lindroos',
}

export default function SnakePvPLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/static/games/snake/pvp/css/landing.css" />
      <link rel="stylesheet" type="text/css" href="/static/games/snake/style.css" />
      <link rel="stylesheet" type="text/css" href="/static/res/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

export const metadata = {
  title: 'Animations',
  description: 'Fireworks animation by Joonas Lindroos',
}

export default function FireworksLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/static/games/fireworks/style.css" />
      <link rel="stylesheet" type="text/css" href="/static/res/fonts/JosefinSans.css" />
      {children}
    </>
  )
}

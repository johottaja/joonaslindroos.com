export const metadata = {
  title: 'Text spread animation',
  description: 'Text spread animation by Joonas Lindroos',
}

export default function TextSpreadLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/static/games/textspread/style.css" />
      <link rel="stylesheet" type="text/css" href="/static/res/fonts/JosefinSans.css" />
      <link rel="stylesheet" type="text/css" href="/static/res/fonts/Avenir.css" />
      {children}
    </>
  )
}

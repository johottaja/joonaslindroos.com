export const metadata = {
  title: 'Text spread animation',
  description: 'Text spread animation by Joonas Lindroos',
}

export default function TextSpreadLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/games/textspread/style.css" />
      <link rel="preload" href="/fonts/JosefinSans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="stylesheet" type="text/css" href="/fonts/JosefinSans.css" />
      <link rel="stylesheet" type="text/css" href="/fonts/Avenir.css" />
      {children}
    </>
  )
}

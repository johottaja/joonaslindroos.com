import './globals.css'

export const metadata = {
  title: 'Joonas Lindroos',
  description: 'Developer, student, enthusiast',
  keywords: 'website, personal website, snake, snake game, text animation, firework animation, portfolio',
  authors: [{ name: 'Joonas Lindroos' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Joonas Lindroos',
    description: 'Developer, student, enthusiast',
    type: 'website',
    url: 'https://joonaslindroos.com',
  },
  twitter: {
    card: 'summary',
    title: 'Joonas Lindroos',
    description: 'Developer, student, enthusiast',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html className="dark overscroll-none" lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/res/images/favicon.ico" />
        <link rel="preload" href="/fonts/New_Amsterdam/NewAmsterdam-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="bg-neutral-950 text-white overscroll-none overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}

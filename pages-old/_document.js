import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html data-bs-theme="dark" lang="en">
      <Head>
        <meta name="keywords" content="website, personal website, snake, snake game, text animation, firework animation, portfolio" />
        <meta name="description" content="Joonas Lindroos - Developer, student, enthusiast" />
        <meta name="author" content="Joonas Lindroos" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Joonas Lindroos" />
        <meta property="og:description" content="Developer, student, enthusiast" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://joonaslindroos.com" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Joonas Lindroos" />
        <meta name="twitter:description" content="Developer, student, enthusiast" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

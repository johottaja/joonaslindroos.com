import Head from 'next/head'
import '/static/landing/css/Fjalla%20One_not_working.css'
import '/static/landing/css/bs-theme-overrides.css'
import '/static/landing/css/aos.min.css'
import '/static/landing/css/Features-Large-Icons-icons.css'
import '/static/landing/css/styles.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/res/images/favicon.ico" />
        <link rel="stylesheet" href="/static/landing/css/FjallaOne.css" />
        <link rel="stylesheet" href="/static/landing/css/bs-theme-overrides.css" />
        <link rel="stylesheet" href="/static/landing/css/aos.min.css" />
        <link rel="stylesheet" href="/static/landing/css/Features-Large-Icons-icons.css" />
        <link rel="stylesheet" href="/static/landing/css/styles.css" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

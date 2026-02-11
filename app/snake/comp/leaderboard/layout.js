export const metadata = {
  title: 'Leaderboards',
  description: 'Snake game leaderboard',
}

export default function LeaderboardLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/games/snake/style.css" />
      <link rel="stylesheet" type="text/css" href="/games/snake/comp/css/leaderboard.css" />
      <link rel="stylesheet" type="text/css" href="/fonts/JosefinSans.css" />
      <link rel="stylesheet" type="text/css" href="/fonts/Pacifico.css" />
      <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
      {children}
    </>
  )
}

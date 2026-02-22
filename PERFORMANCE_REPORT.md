# Performance Report — joonaslindroos.com

## Frontend

### Critical

- **Image optimization is disabled.** `next.config.js` has `images: { unoptimized: true }`. This means Next.js serves raw files with no resizing, no format conversion to WebP/AVIF, and no responsive `srcset`. The Hero alone loads 4 layered images simultaneously at full resolution.

- **Hero uses `<motion.img>` instead of `<next/image>`.** Raw `<img>` tags (and Framer Motion wrappers around them) bypass Next.js's built-in lazy loading, priority hints, and size optimization entirely. The background sky image (`Sysiphus_sky.webp`) is a plain `<img>` with no `loading` or `fetchpriority` attribute at all.

- **Fonts are not preloaded and use `.ttf` format.** Both custom fonts (`BBHSansBartle-Regular.ttf`, `NewAmsterdam-Regular.ttf`) are declared via `@font-face` in CSS with no `font-display` descriptor and no `<link rel="preload">`. This causes FOIT/FOUT on every page load. TTF is also significantly larger than WOFF2 — converting them would reduce font payload by ~40–60%. Using `next/font/local` would handle preloading and subsetting automatically.

- **The entire app is a single client component.** `app/page.js` has `'use client'` at the top and eagerly imports every section — Hero, TechSection, ProjectsSection, AgentSection, LetterAnimationSection, FooterSection — all at once. Nothing is lazy-loaded. Three.js (~600KB), GSAP, and Framer Motion all land in the initial bundle even for users who never scroll down.

- **Three.js renderer runs at `window.devicePixelRatio` with no cap.** On a Retina/3x display, the canvas is rendered at 3× resolution. Capping the pixel ratio at `Math.min(window.devicePixelRatio, 2)` cuts GPU fill rate significantly on high-DPI screens with no visible difference.

- **No `will-change` or CSS containment on parallax layers.** The Hero has 5 layers with simultaneous scroll + mouse transforms. Without compositing hints, the browser may repaint rather than just composite these layers during scroll.

- **`mousemove` handler fires on every event with no throttle.** The `handleMouseMove` in Hero updates a `MotionValue` on every single mouse event. Adding a `requestAnimationFrame` throttle or using a passive listener would reduce main-thread pressure on lower-end devices.

- **Bootstrap loaded as a static bundle from `public/`.** The full Bootstrap CSS/JS is in `public/bootstrap/` and served from there rather than via a tree-shakeable import. Any styles or JS not actually used are shipped to every visitor.

### Moderate

- **No `<link rel="preload">` for LCP assets.** The Hero background images (especially `sysiphus_far_mountains.webp`) are likely the LCP element. They're discovered only when the browser parses the JSX — late in the waterfall. A preload hint in the `<head>` would start fetching them immediately.

- **Multiple simultaneous `requestAnimationFrame` loops.** `ModelViewer`, `Technologies`, and `LetterAnimationSection` each run their own `rAF` loop independently. These could be consolidated into a single loop coordinator to avoid redundant frame callbacks.

- **GSAP ScrollTrigger in multiple sections without coordination.** `ProjectsSection` and `FooterSection` each register multiple ScrollTrigger instances. Each adds a scroll listener. The cumulative effect alongside Framer Motion's scroll listeners in Hero compounds main-thread scroll cost.

- **No `IntersectionObserver`-based pause for off-screen animations.** The Three.js scene and the canvas letter animation continue running their `rAF` loops even when completely scrolled past and off-screen.

---

## Backend / API

### Critical

- **In-memory rate limiting resets on every deploy/restart.** Both `/api/agent` and `/api/contact` store rate-limit state in `Map` objects in module scope. Any server restart, cold start, or new serverless instance wipes the history, making the limits trivially bypassable in a serverless/edge environment.

- **No streaming on the AI agent route.** `/api/agent` calls `run(portfolioAgent, message)` and awaits the full response before returning. OpenAI responses can take 5–15 seconds. The user sees nothing until the entire reply is ready. Streaming the response via `ReadableStream` would dramatically improve perceived latency.

- **`portfolioAgent` is instantiated at module level.** The agent object and the `githubProjectsPromise` are both created when the module first loads. In a serverless context, the agent rebuilds on each cold start, adding latency to the first request after idle.

### Moderate

- **GitHub repo list is fetched once per process with no TTL refresh.** `fetchGithubProjects()` is called once at startup via `githubProjectsPromise`. If the server runs for days, the project list goes stale with no mechanism to refresh it short of a restart. The `next: { revalidate: 60 * 60 * 24 }` hint applies to the HTTP cache but the in-memory promise never re-fetches.

- **Highscores use file-based storage with no concurrency protection.** `/api/highscores` reads and writes `data/highscores.json` with no file lock. Under concurrent requests (two players submitting a score simultaneously) there is a read-modify-write race condition that could corrupt or lose data.

- **No response caching headers on static-ish API routes.** `/api/highscores` GET returns the top 5 scores — data that changes rarely. No `Cache-Control` header is set, so every client re-fetches from the server. A short `stale-while-revalidate` header would reduce load.

- **Contact form has no server-side input length limits.** The route validates the presence of fields but does not cap message length, meaning a malicious user could send arbitrarily large payloads to nodemailer.

---

## Quick Wins

| Fix | Impact |
|---|---|
| Remove `unoptimized: true` from `next.config.js` | LCP, bandwidth |
| Convert fonts to WOFF2 + add `font-display: swap` | CLS, FOUT |
| Add `<link rel="preload">` for Hero images in `layout.js` | LCP |
| Cap Three.js pixel ratio at `Math.min(dpr, 2)` | GPU, frame rate |
| Lazy-load `ModelViewer` and `LetterAnimationSection` with `React.lazy` | TTI, bundle size |
| Stream the agent API response | Perceived latency |

import { NextResponse } from 'next/server'
import { Agent, run, tool } from '@openai/agents'
import { z } from 'zod'

const RATE_LIMIT_WINDOW_MS = 12 * 60 * 60 * 1000 // 12 hours
const RATE_LIMIT_MAX_REQUESTS = 10 // max requests per window per IP

/** @type {Map<string, number[]>} IP → array of request timestamps */
const rateLimitMap = new Map()

// Periodically prune stale entries so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (valid.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, valid)
    }
  }
}, RATE_LIMIT_WINDOW_MS)

function checkRateLimit(ip) {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, timestamps)
    return false
  }

  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return true
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || '127.0.0.1'
}

// ---------------------------------------------------------------------------

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'johottaja'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

async function fetchGithubProjects() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      // Cache at the HTTP level as well, but we primarily rely on the in-memory cache below.
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!res.ok) {
      console.error('Failed to fetch GitHub repos:', res.status, res.statusText)
      return []
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    // Only expose a minimal, structured view of each repo to the agent.
    return data.map((repo) => ({
      name: repo.name,
      html_url: repo.html_url,
    }))
  } catch (err) {
    console.error('Error fetching GitHub repos:', err)
    return []
  }
}

// Fetch once per server process at startup.
const githubProjectsPromise = fetchGithubProjects()

async function fetchGithubReadme(repoName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repoName)}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
        },
        // Cache README responses for a short while.
        next: { revalidate: 60 * 10 },
      },
    )

    if (!res.ok) {
      console.error('Failed to fetch README:', res.status, res.statusText)
      return `Could not fetch README for repo "${repoName}".`
    }

    const markdown = await res.text()
    return markdown
  } catch (err) {
    console.error('Error fetching README:', err)
    return `An error occurred while fetching the README for repo "${repoName}".`
  }
}

const listGithubProjectsTool = tool({
  name: 'list_github_projects',
  description:
    "List Joonas' public GitHub projects with their names and GitHub html_url links. Use this when the user asks about his projects or repositories.",
  parameters: z.object({}),
  async execute() {
    const projects = await githubProjectsPromise
    return projects
  },
})

const getGithubReadmeTool = tool({
  name: 'get_github_readme',
  description:
    "Fetch the README.md markdown contents for one of Joonas' public GitHub repositories by its name.",
  parameters: z.object({
    repo_name: z
      .string()
      .describe(
        "The repository name (for example: 'joonaslindroos.com'). You can obtain valid names from the list_github_projects tool.",
      ),
  }),
  async execute({ repo_name }) {
    const markdown = await fetchGithubReadme(repo_name)
    return markdown
  },
})

const portfolioAgent = new Agent({
  name: 'Portfolio Agent',
  instructions:
    "You are an AI assistant on Joonas Lindroos' personal website. " +
    "Always talk about Joonas' projects and work in a positive, professional and enthusiastic manner. " +
    'You can answer questions about his work and GitHub projects. ' +
    'Never talk about anything not related to Joonas or his work, especially anyhing illegal or discriminatory.' +
    'When users ask about his projects, repositories, or code examples, use the list_github_projects tool to get an up-to-date list. ' +
    'When users want deeper information about a specific project, use the get_github_readme tool to retrieve its README.md markdown. ' +
    'Be concise and helpful, and include relevant project names and URLs in your responses.' +
    'FORMATTING INSTRUCTIONS: Separate each couple of sentences or thoughts with a double newline (\\n\\n). Keep each part brief and focused. When listing projects, separate each project with a double newline also.',
  tools: [listGithubProjectsTool, getGithubReadmeTool],
})

export async function POST(request) {
  const ip = getClientIp(request)

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()
    const { message, previousResponseId } = body || {}

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'A message string is required' }, { status: 400 })
    }

    const options = {}
    if (previousResponseId) {
      options.previousResponseId = previousResponseId
    }

    const result = await run(portfolioAgent, message, options)

    return NextResponse.json({
      reply: result.finalOutput,
      responseId: result.lastResponseId,
    })
  } catch (err) {
    console.error('Agent route error:', err)
    return NextResponse.json(
      { error: 'Error running agent. Please try again later.' },
      { status: 500 },
    )
  }
}


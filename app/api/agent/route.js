import { NextResponse } from 'next/server'
import { Agent, run, tool } from '@openai/agents'
import { z } from 'zod'

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
    'You can answer questions about his work and GitHub projects. ' +
    'When users ask about his projects, repositories, or code examples, use the list_github_projects tool to get an up-to-date list. ' +
    'When users want deeper information about a specific project, use the get_github_readme tool to retrieve its README.md markdown. ' +
    'Be concise and helpful, and include relevant project names and URLs in your responses.',
  tools: [listGithubProjectsTool, getGithubReadmeTool],
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { message } = body || {}

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const result = await run(portfolioAgent, message.trim())

    return NextResponse.json({
      reply: result.finalOutput,
    })
  } catch (err) {
    console.error('Agent route error:', err)
    return NextResponse.json(
      { error: 'Error running agent. Please try again later.' },
      { status: 500 },
    )
  }
}


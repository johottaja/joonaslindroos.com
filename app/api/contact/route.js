import nodemailer from 'nodemailer'
import axios from 'axios'
import { NextResponse } from 'next/server'

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const RATE_LIMIT_MAX = 3

/** @type {Map<string, number[]>} IP → array of submission timestamps */
const recentSubmissions = new Map()

// Prune stale entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of recentSubmissions) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (valid.length === 0) {
      recentSubmissions.delete(ip)
    } else {
      recentSubmissions.set(ip, valid)
    }
  }
}, RATE_LIMIT_WINDOW_MS)

function checkRateLimit(ip) {
  const now = Date.now()
  const timestamps = (recentSubmissions.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )

  if (timestamps.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(ip, timestamps)
    return false
  }

  timestamps.push(now)
  recentSubmissions.set(ip, timestamps)
  return true
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, message, 'g-recaptcha-response': recaptchaResponse } = body

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    if (name.length < 1 || name.length > 30) {
      return NextResponse.json({ message: 'Name is invalid' }, { status: 400 })
    }

    if (message.length < 1 || message.length > 300) {
      return NextResponse.json({ message: 'Message is invalid' }, { status: 400 })
    }

    if (email.length < 1 || email.length > 150 || !email.includes('@')) {
      return NextResponse.json({ message: 'Email is invalid' }, { status: 400 })
    }

    // Check for rate limiting (3 per 24 hours per IP)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ message: 'Too many messages.' }, { status: 429 })
    }

    // Verify reCAPTCHA (only if configured)
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaResponse) {
        return NextResponse.json({ message: 'reCAPTCHA is required' }, { status: 400 })
      }
      const recaptchaSuccess = await verifyRecaptcha(recaptchaResponse, clientIP)
      if (!recaptchaSuccess) {
        return NextResponse.json({ message: 'reCAPTCHA verification failed' }, { status: 400 })
      }
    }

    // Send email
    await sendFeedbackEmail({ name, email, message }, clientIP)

    return NextResponse.json({ message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ message: 'An error occurred while sending your message' }, { status: 500 })
  }
}

async function verifyRecaptcha(token, ip) {
  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip: ip
      }
    })
    return response.data.success
  } catch (error) {
    console.error('Recaptcha verification error:', error)
    return false
  }
}

async function sendFeedbackEmail(body, ip) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.FEEDBACK_EMAIL_ADDRESS,
      pass: process.env.FEEDBACK_EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: body.email,
    to: process.env.FEEDBACK_EMAIL_ADDRESS,
    subject: `New Contact Form Submission from ${body.name}`,
    text: `${body.email} [${ip}] wants to say the following:\n${body.message}`,
  }

  return transporter.sendMail(mailOptions)
}

import nodemailer from 'nodemailer'
import axios from 'axios'
import { NextResponse } from 'next/server'

const recentSubmissions = new Map()

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, message, 'g-recaptcha-response': recaptchaResponse } = body

    // Basic validation
    if (!name || !email || !message || !recaptchaResponse) {
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

    // Check for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (recentSubmissions.has(clientIP)) {
      return NextResponse.json({ message: 'Too many messages, try again later' }, { status: 429 })
    }

    // Verify reCAPTCHA
    const recaptchaSuccess = await verifyRecaptcha(recaptchaResponse, clientIP)
    if (!recaptchaSuccess) {
      return NextResponse.json({ message: 'reCAPTCHA verification failed' }, { status: 500 })
    }

    // Send email
    await sendFeedbackEmail({ name, email, message }, clientIP)
    
    // Set rate limiting
    recentSubmissions.set(clientIP, Date.now())
    setTimeout(() => recentSubmissions.delete(clientIP), 60000 * 5)

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
  const transporter = nodemailer.createTransporter({
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

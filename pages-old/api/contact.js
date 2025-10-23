import nodemailer from 'nodemailer'
import axios from 'axios'

const recentSubmissions = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, message, 'g-recaptcha-response': recaptchaResponse } = req.body

  // Basic validation
  if (!name || !email || !message || !recaptchaResponse) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  if (name.length < 1 || name.length > 30) {
    return res.status(400).json({ message: 'Name is invalid' })
  }

  if (message.length < 1 || message.length > 300) {
    return res.status(400).json({ message: 'Message is invalid' })
  }

  if (email.length < 1 || email.length > 150 || !email.includes('@')) {
    return res.status(400).json({ message: 'Email is invalid' })
  }

  // Check for rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  if (recentSubmissions.has(clientIP)) {
    return res.status(429).json({ message: 'Too many messages, try again later' })
  }

  try {
    // Verify reCAPTCHA
    const recaptchaSuccess = await verifyRecaptcha(recaptchaResponse, clientIP)
    if (!recaptchaSuccess) {
      return res.status(500).json({ message: 'reCAPTCHA verification failed' })
    }

    // Send email
    await sendFeedbackEmail({ name, email, message }, clientIP)
    
    // Set rate limiting
    recentSubmissions.set(clientIP, Date.now())
    setTimeout(() => recentSubmissions.delete(clientIP), 60000 * 5)

    return res.status(200).json({ message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact form error:', error)
    return res.status(500).json({ message: 'An error occurred while sending your message' })
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

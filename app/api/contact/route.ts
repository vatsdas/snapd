import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const { name, email, subject, message } = parsed.data

    await getResend().emails.send({
      from: 'onboarding@resend.dev',
      to: 'snapd.co@gmail.com',
      subject: `[Snapd Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="border-bottom: 2px solid #0A0A0A; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0;">New Contact Form Submission</h1>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; width: 120px;">Name</td>
              <td style="padding: 12px 0; font-size: 15px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Email</td>
              <td style="padding: 12px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #5EADA4;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Subject</td>
              <td style="padding: 12px 0; font-size: 15px;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Message</td>
              <td style="padding: 12px 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    )
  }
}

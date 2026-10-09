import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { withRateLimit } from '@/backend/middleware/withRateLimit';
import nodemailer from 'nodemailer';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const { name, email, category, message } = await req.json();

    if (!name || !email || !category || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (
      typeof name !== 'string' || name.length > 100 ||
      typeof email !== 'string' || email.length > 200 ||
      typeof message !== 'string' || message.length > 5000
    ) {
      return NextResponse.json({ error: 'Invalid input length or type' }, { status: 400 });
    }

    const ALLOWED_CATEGORIES = ['bug', 'feature', 'billing', 'other'];
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // 1. Save to Database
    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        category,
        message,
      },
    });

    // 2. Send Email Notification
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const safeName = escapeHtml(String(name));
      const safeEmail = escapeHtml(String(email));
      const safeCategory = escapeHtml(String(category));
      const safeMessage = escapeHtml(String(message));

      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`, // use authenticated user as sender to avoid spam filters
        replyTo: email,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `New FileConvert Feedback: ${category}`,
        text: `You have received new feedback from ${name} (${email}).\n\nCategory: ${category}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 32px; background: #13141a; border-radius: 12px; border: 1px solid #2a2d3a;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #ffffff; margin: 0;">New User Feedback</h2>
              <p style="color: #8b8d98; margin-top: 8px;">A user has submitted a new feedback request via the help center.</p>
            </div>
            
            <div style="background: #1e1f2a; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #8b8d98; width: 80px; font-size: 14px;">Name</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: bold;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8b8d98; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; color: #7c6ef5; font-size: 15px; font-weight: bold;">
                    <a href="mailto:${safeEmail}" style="color: #7c6ef5; text-decoration: none;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8b8d98; font-size: 14px;">Category</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: bold;">
                    <span style="background: #2a2d3a; padding: 4px 10px; border-radius: 16px; font-size: 13px;">${safeCategory}</span>
                  </td>
                </tr>
              </table>
            </div>

            <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px;">Message</h3>
            <div style="background: #1e1f2a; padding: 16px; border-radius: 8px; border-left: 4px solid #7c6ef5;">
              <p style="color: #d1d5db; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #2a2d3a; margin: 32px 0 24px 0;" />
            <p style="color: #555; font-size: 12px; text-align: center;">FileConvert Internal Notification System</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, { limit: 5, windowSec: 3600, prefix: 'rl:feedback' });

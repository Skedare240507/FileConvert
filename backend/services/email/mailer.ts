/**
 * services/email/mailer.ts
 *
 * Transactional email service using Nodemailer.
 * Used for: OTP delivery, password reset, payment receipts (future).
 */

import nodemailer from 'nodemailer';
import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info(`[Mailer] Email sent to ${options.to}: ${options.subject}`);
  } catch (err) {
    logger.error('[Mailer] Failed to send email:', err);
    throw err;
  }
}

// ── Email templates ───────────────────────────────────────────────────────

export async function sendOtpEmail(to: string, otp: string, purpose: 'signup' | 'reset_password') {
  const subject = purpose === 'signup' ? 'Verify your FileConvert account' : 'Reset your password';
  const action = purpose === 'signup' ? 'verify your account' : 'reset your password';

  return sendEmail({
    to,
    subject,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">FileConvert</h2>
        <p>Use the following code to ${action}:</p>
        <div style="background: #f4f4f8; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
    text: `Your FileConvert verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
  });
}

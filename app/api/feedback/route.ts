import { NextResponse } from 'next/server';
import { prisma } from '../../../backend/db';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, category, message } = await req.json();

    if (!name || !email || !category || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`, // use authenticated user as sender to avoid spam filters
        replyTo: email,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `New FileConvert Feedback: ${category}`,
        text: `You have received new feedback from ${name} (${email}).\n\nCategory: ${category}\n\nMessage:\n${message}`,
        html: `<p>You have received new feedback.</p>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Category:</strong> ${category}</p>
               <p><strong>Message:</strong></p>
               <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
                 ${message.replace(/\n/g, '<br/>')}
               </blockquote>`,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Email integration via Nodemailer over SMTP.
// Works with any SMTP provider: a free Gmail App Password, Ethereal (test),
// Brevo/SendinBlue free tier, etc.

import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new ApiError(400, 'Email not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)');
  }
  const port = Number(SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false (STARTTLS) for 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

// Sends a plain-text (and optional HTML) email.
export async function sendEmail({ to, subject, text, html } = {}) {
  if (!to || !subject || (!text && !html)) {
    throw new ApiError(400, 'Email requires to, subject and a body (text or html)');
  }
  const tx = getTransporter();
  const info = await tx.sendMail({
    from: process.env.MAIL_FROM || 'TaskFlow <no-reply@taskflow.local>',
    to,
    subject,
    text,
    html,
  });
  return { ok: true, messageId: info.messageId };
}

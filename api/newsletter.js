// === /api/newsletter.js ===
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Missing Gmail credentials' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  try {
    await Promise.all([
      transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: 'titanworkcm@gmail.com',
        subject: '📧 New Newsletter Subscription - Deltora Labs',
        text: `New subscriber: ${email}`
      }),
      transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: '🚀 Welcome to Deltora Labs Newsletter!',
        text: 'Thank you for subscribing!'
      })
    ]);

    res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
  }
}

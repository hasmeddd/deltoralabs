// === /api/send-email.js ===
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method allowed' });
  }

  const {
    projectName,
    xAccount,
    yourName,
    telegramHandle,
    budget,
    projectDescription
  } = req.body;

  if (!projectName || !xAccount || !yourName || !telegramHandle || !budget) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
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

  const htmlContent = `
    <h2>New Application from Deltora Labs</h2>
    <p><strong>Project:</strong> ${projectName}</p>
    <p><strong>X:</strong> <a href="${xAccount}">${xAccount}</a></p>
    <p><strong>Name:</strong> ${yourName}</p>
    <p><strong>Telegram:</strong> @${telegramHandle.replace('@', '')}</p>
    <p><strong>Budget:</strong> ${budget}</p>
    ${projectDescription ? `<p><strong>Description:</strong><br>${projectDescription.replace(/\n/g, '<br>')}</p>` : ''}
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'titanworkcm@gmail.com',
      subject: `🚀 New Application: ${projectName} - ${budget}`,
      html: htmlContent
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email failed to send', error: error.message });
  }
} 
// api/contact.js (Vercel Serverless Function for Email Delivery)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  const gmailUser = process.env.GMAIL_USER || 'vanshgpt2911@gmail.com';
  const gmailPass = process.env.GMAIL_APP_PASSWORD || 'lmxq pazg etkm dxhq';

  if (!gmailPass) {
    console.error('GMAIL_APP_PASSWORD environment variable is missing.');
    return res.status(500).json({
      error: 'Email delivery requires GMAIL_APP_PASSWORD configured in Vercel environment variables.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s+/g, ''),
      },
    });

    const mailSubject = subject && subject.trim()
      ? `💼 Portfolio Message [${subject.trim()}]: from ${name.trim()}`
      : `💼 Portfolio Message: from ${name.trim()}`;

    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${gmailUser}>`,
      to: 'vanshgpt2911@gmail.com',
      replyTo: email.trim(),
      subject: mailSubject,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject ? subject.trim() : 'N/A'}\n\nMessage:\n${message.trim()}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0c0c; color: #d7e2ea; padding: 32px; border-radius: 12px; border: 1px solid rgba(215,226,234,0.15); max-width: 600px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #b600a8; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="color: #ffaceb; margin: 0; font-size: 22px; letter-spacing: 0.05em;">📬 New Portfolio Message</h2>
            <p style="color: rgba(215,226,234,0.6); margin: 6px 0 0 0; font-size: 13px;">Received via your website contact form</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; color: rgba(215,226,234,0.6); width: 90px; font-size: 14px;"><strong>From:</strong></td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: 600;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: rgba(215,226,234,0.6); font-size: 14px;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email.trim()}" style="color: #ffaceb; text-decoration: none;">${email.trim()}</a></td>
            </tr>
            ${subject ? `
            <tr>
              <td style="padding: 8px 0; color: rgba(215,226,234,0.6); font-size: 14px;"><strong>Subject:</strong></td>
              <td style="padding: 8px 0; color: #e2b6ff; font-size: 15px;">${subject.trim()}</td>
            </tr>` : ''}
          </table>
          
          <div style="background: rgba(215,226,234,0.04); border: 1px solid rgba(215,226,234,0.1); border-radius: 8px; padding: 18px; margin-bottom: 24px;">
            <h4 style="color: #ffaceb; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Message Body</h4>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #d7e2ea; margin: 0; font-size: 15px;">${message.trim()}</p>
          </div>
          
          <div style="border-top: 1px solid rgba(215,226,234,0.1); padding-top: 16px; text-align: center; color: rgba(215,226,234,0.4); font-size: 12px;">
            Reply directly to this email to respond to <strong>${email.trim()}</strong>.
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully! Vansh will get back to you soon.' });
  } catch (error) {
    console.error('Nodemailer error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}

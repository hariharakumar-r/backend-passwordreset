import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
  try {
    console.log(`[sendEmail] Starting email send to: ${to}`);
    console.log(`[sendEmail] Email User: ${process.env.EMAIL_USER}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[sendEmail] Missing email credentials!');
      throw new Error('Email credentials not configured in environment variables');
    }
    
    console.log(`[sendEmail] Creating transporter...`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      logger: true,
      debug: true
    });

    console.log(`[sendEmail] Testing SMTP connection...`);
    
    // Verify connection configuration
    await transporter.verify();
    console.log(`[sendEmail] SMTP connection verified successfully`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    console.log(`[sendEmail] Sending mail with options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[sendEmail] ✓ Email sent successfully!`);
    console.log(`[sendEmail] Message ID: ${info.messageId}`);
    console.log(`[sendEmail] Response: ${info.response}`);
    
    return info;
  } catch (error) {
    console.error('[sendEmail] ✗ CRITICAL ERROR:', error);
    console.error('[sendEmail] Error Code:', error.code);
    console.error('[sendEmail] Error Message:', error.message);
    console.error('[sendEmail] Full Error:', JSON.stringify(error, null, 2));
    
    throw error;
  }
};

export default sendEmail;

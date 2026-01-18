import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
  try {
    console.log(`[sendEmail] Preparing email for: ${to}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured');
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log(`[sendEmail] Transporter created`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[sendEmail] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('[sendEmail] Error:', error.message);
    throw error;
  }
};

export default sendEmail;

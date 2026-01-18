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
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 2000,
      rateLimit: 5,
      socketTimeout: 5000,
      connectionTimeout: 5000
    });

    console.log(`[sendEmail] Transporter created`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    // Add timeout promise wrapper
    const sendMailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email sending timeout after 20 seconds')), 20000)
    );

    const info = await Promise.race([sendMailPromise, timeoutPromise]);
    console.log(`[sendEmail] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('[sendEmail] Error:', error.message);
    throw error;
  }
};

export default sendEmail;

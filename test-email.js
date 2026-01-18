import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  try {
    console.log('Testing email...');
    console.log('User:', process.env.EMAIL_USER);
    
    await transporter.verify();
    console.log('✓ SMTP connection verified!');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      html: '<h1>Test</h1>'
    });
    
    console.log('✓ Email sent! Message ID:', info.messageId);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testEmail();

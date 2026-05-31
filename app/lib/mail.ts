import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE !== 'false',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const from = `"Hema Sarees" <no-reply@${process.env.EMAIL_DOMAIN || 'example.com'}>`;
  
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};


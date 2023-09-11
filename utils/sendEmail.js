import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'ecommerce',
    link: 'http://127.0.0.1:3001',
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, emailBody }) => {
  const info = await transporter.sendMail({
    from: 'admin',
    to,
    subject,
    html: mailGenerator.generate(emailBody),
  });
};

export { sendEmail };

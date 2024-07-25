// mailer.js
import nodemailer from 'nodemailer';

// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cheeikhmbacke@gmail.com', // Replace with your email
    pass: 'zsnm kdcc akgj ikf',  // Replace with your email password or app password
  },
});

// Function to send an email
export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'cheeikhmbacke@gmail.com', // Replace with your email
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

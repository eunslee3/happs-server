import * as twilio from 'twilio';
import * as nodemailer from 'nodemailer';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// SMS authentication
const createMessage = async (phoneNumber: string, token: number) => {
  const message = await client.messages.create({
    body: `This is your one-time token: ${token}. This expires in 5 minutes.`,
    from: "+15017122661",
    to: `${phoneNumber}`,
  });

  console.log(message.body)
}

// Email authentication
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: 'happs@happs.life',
    pass: process.env.ZOHO_EMAIL_PASS,
  },
});

const sendEmail = async (to: string, token: number) => {
  const html = 
  `
  <h1>Email Verification</h1>
  <p>Hello, this is your one-time token: ${token}. This expires in 5 minutes.</p>
  `
  const subject = 'Email Verification For happs';
  const mailOptions = {
    from: 'happs@happs.life',
    to,
    subject,
    html
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    throw new Error(error)
  }
}

export const handleSendVerificationToken = async (
  email: string, 
  phoneNumber: string, 
  token: number
) => {
  if (phoneNumber) {
    await createMessage(phoneNumber, token);
  } else {
    await sendEmail(email, token);
  }
}
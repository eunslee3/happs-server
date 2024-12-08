import * as twilio from 'twilio';
import * as nodemailer from 'nodemailer';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// SMS authentication
const createMessage = async (phoneNumber: string, token: number) => {
  await client.messages.create({
    body: `This is your one-time token: ${token}. This expires in 5 minutes.`,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    to: phoneNumber,
  });
  console.log('SMS Sent')
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
  try {
    if (phoneNumber) {
      await createMessage(phoneNumber, token);
    } else {
      await sendEmail(email, token);
    }
    return {
      message: 'Verification token sent successfully',
      status: 200,
    }
  } catch (error) {
    console.error(error);
    return({
      message: 'Failed to send verification token',
      status: 400,
    })
  }
}
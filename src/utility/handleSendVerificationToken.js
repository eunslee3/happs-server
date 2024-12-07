const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new twilio(accountSid, authToken);

const createMessage = async (phoneNumber, generatedToken) => {
  const message = await client.messages.create({
    body: `This is your one-time token: ${generatedToken}. This expires in 5 minutes.`,
    from: "+15017122661",
    to: `${phoneNumber}`,
  });
}
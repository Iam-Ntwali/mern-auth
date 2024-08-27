import { MailtrapTransport } from "mailtrap";
import dotenv from "dotenv";

const TOKEN = "";
const ENDPOINT = "https://send.api.mailtrap.io/";

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

const sender = {
  email: "mailtrap@ibtc-elearning.com",
  name: "Mailtrap Test",
};
const recipients = [
  {
    email: "donatmuhaye@gmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);
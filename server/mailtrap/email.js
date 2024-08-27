import { mailTrapClient } from "./mailtrap.config.js";

export const sendVerificationEmail = async (user, verificationToken) => {
  const recipients = [{ email }]

  try {
    const res = await mailTrapClient.send({
      from: sender,
      to: recipients,
      subject: "Verify your email address",
      html: ''
    });
  } catch (error) {

  }
};
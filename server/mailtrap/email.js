import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }]

  try {
    const email = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Verification Email",
    });
  } catch (error) {
    console.log('Error sending verification email:', error);
    throw new Error('Error sending verification email:', error);
  }
};
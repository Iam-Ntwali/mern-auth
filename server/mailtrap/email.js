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

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "795a4680-4671-4227-be14-85ebbf6de1dc",
      template_variables: {
        "company_info_name": "IBTC Film School",
        "name": name
      }
    })

    console.log('Welcome email sent successfully');
  } catch (err) {
    console.log('Error sending welcome email:', err);
    throw new Error('Error sending welcome email:', err);
  }
}
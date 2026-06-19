const transporter = require('../config/nodemailer');

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #0D0F14; font-family: 'Arial', sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #12151C; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #12151C 0%, #1a1f2c 100%); padding: 40px 32px; text-align: center; border-bottom: 2px solid #C8F135; }
    .logo-text { font-size: 32px; font-weight: 900; color: #C8F135; letter-spacing: 4px; }
    .tagline { color: #6B7280; font-size: 14px; margin-top: 4px; }
    .body { padding: 40px 32px; color: #E5E7EB; }
    .body h2 { color: #F9FAFB; font-size: 24px; margin: 0 0 16px; }
    .body p { color: #9CA3AF; line-height: 1.7; margin: 0 0 16px; }
    .otp-box { background: #1a1f2c; border: 2px solid #C8F135; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 900; color: #C8F135; letter-spacing: 12px; }
    .otp-label { color: #6B7280; font-size: 13px; margin-top: 8px; }
    .btn { display: inline-block; background: #C8F135; color: #0D0F14; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin: 16px 0; font-size: 16px; }
    .divider { height: 1px; background: #1F2937; margin: 24px 0; }
    .footer { padding: 24px 32px; text-align: center; }
    .footer p { color: #4B5563; font-size: 12px; margin: 4px 0; }
    .footer a { color: #C8F135; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="wrapper">
      <div class="header">
        <div class="logo-text">⚡ GYMMIX</div>
        <div class="tagline">Train Smarter. Live Stronger.</div>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Gymmix. All rights reserved.</p>
        <p>You received this email because you have an account with Gymmix.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const sendOTPEmail = async ({ to, name, otp, type = 'verify' }) => {
  const isReset = type === 'reset';
  const subject = isReset ? 'Gymmix — Password Reset OTP' : 'Gymmix — Verify Your Email';
  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const bodyText = isReset
    ? 'You requested a password reset. Use the OTP below to create a new password. This code expires in 10 minutes.'
    : 'Welcome to Gymmix! Use the OTP below to verify your email address. This code expires in 10 minutes.';

  const html = baseTemplate(`
    <h2>${heading}</h2>
    <p>Hi ${name},</p>
    <p>${bodyText}</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-label">OTP expires in 10 minutes</div>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px;">If you didn't request this, please ignore this email or contact support.</p>
  `);

  await transporter.sendMail({ from: `"Gymmix" <${process.env.EMAIL_USER}>`, to, subject, html });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const html = baseTemplate(`
    <h2>Welcome to Gymmix, ${name}! 🎉</h2>
    <p>Your account is now verified and ready to go. Start your fitness journey today — track workouts, monitor nutrition, and crush your goals.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
    <div class="divider"></div>
    <p style="font-size: 13px;">Need help? Check out our <a href="${process.env.CLIENT_URL}/faq">FAQ</a> or reply to this email.</p>
  `);

  await transporter.sendMail({
    from: `"Gymmix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to Gymmix — Let\'s Get Started! 💪',
    html,
  });
};

const sendNewsletterWelcome = async ({ to, firstName, unsubscribeToken }) => {
  const unsubscribeUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const html = baseTemplate(`
    <h2>You're on the list! 📧</h2>
    <p>Hi ${firstName || 'there'},</p>
    <p>Thanks for subscribing to the Gymmix newsletter! Expect weekly fitness tips, workout plans, nutrition advice, and exclusive deals delivered straight to your inbox.</p>
    <a href="${process.env.CLIENT_URL}" class="btn">Explore Gymmix →</a>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #4B5563;">Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a></p>
  `);

  await transporter.sendMail({
    from: `"Gymmix Newsletter" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'You\'re subscribed to Gymmix Newsletter! 💪',
    html,
  });
};

const sendNewsletterBroadcast = async ({ subscribers, subject, content }) => {
  const results = [];
  for (const subscriber of subscribers) {
    try {
      const unsubscribeUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
      const html = baseTemplate(`
        ${content}
        <div class="divider"></div>
        <p style="font-size: 12px; color: #4B5563;">You're receiving this because you subscribed to Gymmix Newsletter. <a href="${unsubscribeUrl}">Unsubscribe</a></p>
      `);
      await transporter.sendMail({
        from: `"Gymmix Newsletter" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject,
        html,
      });
      results.push({ email: subscriber.email, success: true });
    } catch (err) {
      results.push({ email: subscriber.email, success: false, error: err.message });
    }
  }
  return results;
};

module.exports = { sendOTPEmail, sendWelcomeEmail, sendNewsletterWelcome, sendNewsletterBroadcast };

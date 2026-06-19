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
    .header { background: linear-gradient(135deg, #12151C 0%, #1a1f2c 100%); padding: 32px; text-align: center; border-bottom: 2px solid #C8F135; }
    .logo-container { margin-bottom: 12px; }
    .logo-text { font-size: 28px; font-weight: 900; color: #F0F2F8; letter-spacing: 4px; font-family: 'Arial Black', sans-serif; text-transform: uppercase; margin-top: 8px; }
    .logo-text span { color: #C8F135; }
    .tagline { color: #6B7280; font-size: 13px; margin-top: 4px; }
    .body { padding: 40px 32px; color: #E5E7EB; }
    .body h2 { color: #F9FAFB; font-size: 22px; margin: 0 0 16px; font-family: 'Arial Black', sans-serif; }
    .body p { color: #9CA3AF; line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
    .otp-box { background: #1a1f2c; border: 2px solid #C8F135; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 900; color: #C8F135; letter-spacing: 12px; }
    .otp-label { color: #6B7280; font-size: 13px; margin-top: 8px; }
    .btn { display: inline-block; background: #C8F135; color: #0D0F14; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin: 16px 0; font-size: 16px; text-align: center; }
    .divider { height: 1px; background: #1F2937; margin: 24px 0; }
    .footer { padding: 24px 32px; text-align: center; border-top: 1px solid #1F2937; }
    .footer p { color: #4B5563; font-size: 12px; margin: 4px 0; }
    .footer a { color: #C8F135; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 24px; background-color: #0D0F14;">
    <div class="wrapper">
      <div class="header">
        <div class="logo-container">
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; vertical-align: middle;">
            <tr>
              <td style="background-color:#C8F135; width:6px; height:30px; border-radius:2px; vertical-align: middle;"></td>
              <td style="width:2px; vertical-align: middle;"></td>
              <td style="background-color:#E5E7EB; width:6px; height:40px; border-radius:2px; vertical-align: middle;"></td>
              <td style="background-color:#C8F135; width:30px; height:8px; vertical-align: middle;"></td>
              <td style="background-color:#E5E7EB; width:6px; height:40px; border-radius:2px; vertical-align: middle;"></td>
              <td style="width:2px; vertical-align: middle;"></td>
              <td style="background-color:#C8F135; width:6px; height:30px; border-radius:2px; vertical-align: middle;"></td>
            </tr>
          </table>
        </div>
        <div class="logo-text">GYM<span>MIX</span></div>
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
  const subject = isReset ? 'Gymmix - Password Reset OTP' : 'Gymmix - Verify Your Email';
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
    <p style="font-size: 13px;">If you did not request this, please ignore this email or contact support.</p>
  `);

  await transporter.sendMail({ from: `"Gymmix" <${process.env.EMAIL_USER}>`, to, subject, html });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const html = baseTemplate(`
    <h2>Welcome to Gymmix, ${name}!</h2>
    <p>Your account is now verified and ready to go. Start your fitness journey today - track workouts, monitor nutrition, and crush your goals.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
    <div class="divider"></div>
    <p style="font-size: 13px;">Need help? Check out our <a href="${process.env.CLIENT_URL}/faq">FAQ</a> or reply to this email.</p>
  `);

  await transporter.sendMail({
    from: `"Gymmix" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to Gymmix - Let\'s Get Started!',
    html,
  });
};

const sendNewsletterWelcome = async ({ to, firstName, unsubscribeToken }) => {
  const unsubscribeUrl = `${process.env.CLIENT_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const html = baseTemplate(`
    <h2>You are on the list!</h2>
    <p>Hi ${firstName || 'there'},</p>
    <p>Thanks for subscribing to the Gymmix newsletter! Expect weekly fitness tips, workout plans, nutrition advice, and exclusive deals delivered straight to your inbox.</p>
    <a href="${process.env.CLIENT_URL}" class="btn">Explore Gymmix</a>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #4B5563;">Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a></p>
  `);

  await transporter.sendMail({
    from: `"Gymmix Newsletter" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'You are subscribed to Gymmix Newsletter!',
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
        <p style="font-size: 12px; color: #4B5563;">You are receiving this because you subscribed to Gymmix Newsletter. <a href="${unsubscribeUrl}">Unsubscribe</a></p>
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

// ── NEW: sendSupportReceiptEmail ──────────────────────────────
const sendSupportReceiptEmail = async ({ to, name, subject, message }) => {
  const html = baseTemplate(`
    <h2>Support Inquiry Received</h2>
    <p>Hi ${name},</p>
    <p>We have successfully received your support inquiry and our team is already reviewing it. Below is a copy of your submission for reference:</p>
    <div style="background: #1A1F2C; border: 1px solid #1F2937; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #F0F2F8;">Subject: ${subject}</p>
      <p style="margin: 0; font-size: 14px; color: #9CA3AF;">${message.replace(/\n/g, '<br/>')}</p>
    </div>
    <p>We typically respond within 24 hours. Thank you for your patience.</p>
  `);

  await transporter.sendMail({
    from: `"Gymmix Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Support Inquiry Received: ${subject}`,
    html,
  });
};

// ── NEW: sendAdminSupportNotificationEmail ────────────────────
const sendAdminSupportNotificationEmail = async ({ name, email, subject, message }) => {
  const html = baseTemplate(`
    <h2>New Support Inquiry Submitted</h2>
    <p>A new inquiry has been submitted through the Contact Us form:</p>
    <table border="0" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; background: #1A1F2C; border-radius: 8px; color: #F0F2F8; font-size: 14px; margin: 16px 0;">
      <tr>
        <td style="width: 120px; color: #6B7280; font-weight: 700; border-bottom: 1px solid #1F2937;">Name:</td>
        <td style="border-bottom: 1px solid #1F2937;">${name}</td>
      </tr>
      <tr>
        <td style="color: #6B7280; font-weight: 700; border-bottom: 1px solid #1F2937;">Email:</td>
        <td style="border-bottom: 1px solid #1F2937;"><a href="mailto:${email}" style="color: #C8F135;">${email}</a></td>
      </tr>
      <tr>
        <td style="color: #6B7280; font-weight: 700; border-bottom: 1px solid #1F2937;">Subject:</td>
        <td style="border-bottom: 1px solid #1F2937;">${subject}</td>
      </tr>
      <tr>
        <td style="color: #6B7280; font-weight: 700; vertical-align: top;">Message:</td>
        <td>${message.replace(/\n/g, '<br/>')}</td>
      </tr>
    </table>
  `);

  await transporter.sendMail({
    from: `"Gymmix Platform Alerts" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Alerts go to the platform owner/admin email
    subject: `[ADMIN ALERT] New Inquiry: ${subject}`,
    html,
  });
};

// ── NEW: sendSubscriptionActivatedEmail ───────────────────────
const sendSubscriptionActivatedEmail = async ({ to, name, tier, amount, expiryDate }) => {
  const html = baseTemplate(`
    <h2>Subscription Activated</h2>
    <p>Hi ${name},</p>
    <p>Your premium plan subscription has been successfully activated. Thank you for your payment!</p>
    <table border="0" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; background: #1A1F2C; border-radius: 8px; color: #F0F2F8; font-size: 14px; margin: 16px 0;">
      <tr>
        <td style="width: 120px; color: #6B7280; font-weight: 700; border-bottom: 1px solid #1F2937;">Selected Plan:</td>
        <td style="border-bottom: 1px solid #1F2937; text-transform: uppercase; color: #C8F135; font-weight: 700;">${tier}</td>
      </tr>
      <tr>
        <td style="color: #6B7280; font-weight: 700; border-bottom: 1px solid #1F2937;">Amount Paid:</td>
        <td style="border-bottom: 1px solid #1F2937;">₱${(amount / 100).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="color: #6B7280; font-weight: 700;">Expiry Date:</td>
        <td>${new Date(expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
    </table>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Explore Premium Features</a>
  `);

  await transporter.sendMail({
    from: `"Gymmix Payments" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Subscription Activated - Gymmix',
    html,
  });
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendNewsletterWelcome,
  sendNewsletterBroadcast,
  sendSupportReceiptEmail,
  sendAdminSupportNotificationEmail,
  sendSubscriptionActivatedEmail,
};

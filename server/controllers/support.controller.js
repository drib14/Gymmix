const SupportInquiry = require('../models/SupportInquiry');
const { sendSupportReceiptEmail, sendAdminSupportNotificationEmail } = require('../services/email.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.createInquiry = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return sendError(res, 'All fields are required.', 400);
    }

    // Save to DB
    const inquiry = await SupportInquiry.create({ name, email, subject, message });

    // Send email confirmation to user (no emojis, table-based logo)
    await sendSupportReceiptEmail({ to: email, name, subject, message }).catch(err =>
      console.error('Failed to send support receipt email:', err)
    );

    // Notify admin/staff
    await sendAdminSupportNotificationEmail({ name, email, subject, message }).catch(err =>
      console.error('Failed to send admin support notification email:', err)
    );

    return sendSuccess(res, 'Support inquiry received.', { inquiry }, 201);
  } catch (err) {
    next(err);
  }
};

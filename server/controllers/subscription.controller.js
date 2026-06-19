const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { createPaymentIntent, attachPaymentMethod, retrievePaymentIntent, PLAN_PRICES } = require('../services/paymongo.service');
const { createNotification } = require('./notification.controller');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendSubscriptionActivatedEmail } = require('../services/email.service');

// ── GET /subscriptions/plans ───────────────────────────────
exports.getPlans = async (req, res, next) => {
  return sendSuccess(res, 'Plans fetched.', {
    plans: [
      { tier: 'free', name: 'Free', price: { monthly: 0, annual: 0 }, features: ['Basic workout tracking', 'Exercise library (view only)', 'Nutrition logging (limited)', '3 workout plans', 'Community access'] },
      { tier: 'pro', name: 'Pro', price: PLAN_PRICES.pro, features: ['Unlimited workout plans', 'Full exercise library', 'Advanced analytics', 'Nutrition macro tracking', 'Goal tracking', 'Priority support'] },
      { tier: 'elite', name: 'Elite', price: PLAN_PRICES.elite, features: ['Everything in Pro', 'Custom meal plans', 'Personalized workout AI', 'Progress photo storage', '1-on-1 coach chat', 'Exclusive content'] },
    ],
  });
};

// ── POST /subscriptions/checkout ───────────────────────────
exports.createCheckout = async (req, res, next) => {
  try {
    const { tier, billingCycle = 'monthly' } = req.body;

    if (!PLAN_PRICES[tier]) return sendError(res, 'Invalid subscription tier.', 400);

    const amount = PLAN_PRICES[tier][billingCycle];
    const intent = await createPaymentIntent({
      amount,
      description: `Gymmix ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan (${billingCycle})`,
      metadata: { userId: req.user._id.toString(), tier, billingCycle },
    });

    const subscription = await Subscription.create({
      user: req.user._id,
      tier,
      billingCycle,
      amount: amount * 100,
      status: 'pending',
      paymongoPaymentIntentId: intent.id,
    });

    return sendSuccess(res, 'Checkout created.', { clientKey: intent.attributes.client_key, subscriptionId: subscription._id });
  } catch (err) { next(err); }
};

// ── POST /subscriptions/webhook ────────────────────────────
exports.webhook = async (req, res, next) => {
  try {
    const event = req.body;
    const { type, data } = event;

    if (type === 'payment.paid') {
      const intent = data.attributes;
      const metadata = intent.metadata;
      if (!metadata?.userId) return res.sendStatus(200);

      const user = await User.findById(metadata.userId);
      if (!user) return res.sendStatus(200);

      const billingDays = metadata.billingCycle === 'annual' ? 365 : 30;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + billingDays);

      user.subscriptionTier = metadata.tier;
      user.subscriptionExpiry = endDate;
      await user.save();

      await Subscription.findOneAndUpdate(
        { paymongoPaymentIntentId: intent.id },
        { status: 'active', startDate: new Date(), endDate, renewalDate: endDate },
        { new: true }
      );

      await createNotification({
        recipient: user._id,
        type: 'subscription',
        title: 'Subscription Activated',
        message: `Your ${metadata.tier} plan is now active. Enjoy all premium features!`,
        link: '/subscription',
      });

      await sendSubscriptionActivatedEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        tier: metadata.tier,
        amount: intent.amount,
        expiryDate: endDate,
      }).catch((err) => console.error('Subscription email notification failed:', err));
    }

    return res.sendStatus(200);
  } catch (err) { next(err); }
};

// ── GET /subscriptions/my ──────────────────────────────────
exports.getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Subscription fetched.', { subscription });
  } catch (err) { next(err); }
};

// ── POST /subscriptions/cancel ─────────────────────────────
exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!subscription) return sendError(res, 'No active subscription found.', 404);
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();
    return sendSuccess(res, 'Subscription cancelled. Access continues until period end.');
  } catch (err) { next(err); }
};

// ── POST /subscriptions/attach ─────────────────────────────
exports.attachPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    if (!paymentIntentId || !paymentMethodId) {
      return sendError(res, 'Missing payment intent or method.', 400);
    }
    const intent = await attachPaymentMethod({
      paymentIntentId,
      paymentMethodId,
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?success=true`,
    });
    return sendSuccess(res, 'Payment method attached.', { intent });
  } catch (err) {
    next(err);
  }
};

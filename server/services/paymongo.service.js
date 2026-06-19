const axios = require('axios');

const PAYMONGO_BASE = 'https://api.paymongo.com/v1';

const paymongoAuth = () =>
  Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');

const createPaymentIntent = async ({ amount, currency = 'PHP', description, metadata = {} }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_intents`,
    {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to centavos
          payment_method_allowed: ['card', 'gcash', 'paymaya'],
          payment_method_options: { card: { request_three_d_secure: 'any' } },
          currency,
          description,
          metadata,
          capture_type: 'automatic',
        },
      },
    },
    { headers: { Authorization: `Basic ${paymongoAuth()}`, 'Content-Type': 'application/json' } }
  );
  return response.data.data;
};

const attachPaymentMethod = async ({ paymentIntentId, paymentMethodId, returnUrl }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_intents/${paymentIntentId}/attach`,
    {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: returnUrl || `${process.env.CLIENT_URL}/subscription/success`,
        },
      },
    },
    { headers: { Authorization: `Basic ${paymongoAuth()}`, 'Content-Type': 'application/json' } }
  );
  return response.data.data;
};

const retrievePaymentIntent = async (paymentIntentId) => {
  const response = await axios.get(`${PAYMONGO_BASE}/payment_intents/${paymentIntentId}`, {
    headers: { Authorization: `Basic ${paymongoAuth()}` },
  });
  return response.data.data;
};

const createPaymentMethod = async ({ type, billingDetails, cardDetails }) => {
  const response = await axios.post(
    `${PAYMONGO_BASE}/payment_methods`,
    {
      data: {
        attributes: {
          type,
          billing: billingDetails,
          details: cardDetails,
        },
      },
    },
    { headers: { Authorization: `Basic ${paymongoAuth()}`, 'Content-Type': 'application/json' } }
  );
  return response.data.data;
};

// Subscription plan pricing (PHP)
const PLAN_PRICES = {
  pro: { monthly: 299, annual: 2990 },
  elite: { monthly: 599, annual: 5990 },
};

module.exports = { createPaymentIntent, attachPaymentMethod, retrievePaymentIntent, createPaymentMethod, PLAN_PRICES };

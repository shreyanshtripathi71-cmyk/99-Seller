const Stripe = require('stripe');

let stripe;

const isEnabled = process.env.ENABLE_PAYMENTS === 'true';

if (isEnabled && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe Service: Initialized');
} else {
    if (!isEnabled) {
        console.log('Stripe Service: Payment gateway is DISABLED (Mock Mode active)');
    } else {
        console.warn('Stripe Service: STRIPE_SECRET_KEY not found. Using mock mode.');
    }
    stripe = {
        paymentIntents: {
            create: async ({ amount, currency }) => {
                console.log(`[MOCK] Creating Payment Intent: ${amount} ${currency}`);
                return {
                    id: 'pi_mock_' + Date.now(),
                    client_secret: 'mock_secret_' + Date.now(),
                    status: 'requires_payment_method',
                    amount: amount,
                    currency: currency
                };
            }
        },
        // Add other mock methods as needed
    };
}

module.exports = stripe;

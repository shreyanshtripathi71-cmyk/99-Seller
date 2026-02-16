const stripe = require('../services/stripeService');
const { UserLogin, Invoice, Subscription } = require('../models');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body;
        const user = req.user;

        // Determine amount based on plan
        let amount = 5000; // $50.00 in cents
        if (planId === 'premium_quarterly' || billingCycle === 'quarterly') {
            amount = 15000; // $150.00
            // Apply discount if logic exists
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                userId: user.Username,
                planId: planId || 'premium_monthly',
                billingCycle: billingCycle || 'monthly'
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: amount
        });

    } catch (error) {
        console.error('Create Payment Intent Error:', error);
        res.status(500).json({ success: false, error: 'Failed to create payment intent' });
    }
};

exports.handleWebhook = async (req, res) => {
    // Basic webhook placeholder
    // In production, verify signature here
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);
            // Function to fulfill order would go here
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

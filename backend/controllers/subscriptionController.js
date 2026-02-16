const { Subscription, UserLogin, PremiumUser, Invoice, PaymentMethod, FreeUser } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Get available subscription plans
exports.getPlans = async (req, res) => {
    try {
        // Hardcoded plans as per requirements
        const plans = [
            {
                id: 'premium_monthly',
                name: 'Premium Monthly',
                price: 50,
                billingCycle: 'monthly',
                description: 'Full access to all premium features',
                features: {
                    searchLimit: -1,
                    exportLimit: 1000,
                    fullDataAccess: true,
                    advancedSearch: true,
                    exportEnabled: true
                },
                popular: false
            },
            {
                id: 'premium_quarterly',
                name: 'Premium Quarterly',
                price: 150,
                billingCycle: 'quarterly',
                description: 'Save with quarterly billing',
                features: {
                    searchLimit: -1,
                    exportLimit: 3000,
                    fullDataAccess: true,
                    advancedSearch: true,
                    exportEnabled: true
                },
                popular: true
            }
        ];

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }
};

// Get current subscription status
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const username = req.user.Username;

        // Fetch fresh user data from DB to ensure UserType is up to date (don't rely on stale token)
        const user = await UserLogin.findOne({ where: { Username: username } });
        const userType = (user?.UserType || 'free').toLowerCase();

        console.log(`[DEBUG] getSubscriptionStatus for ${username}: DB UserType=${user?.UserType}, Resolved=${userType}`);

        let data = {
            isActive: userType !== 'free',
            plan: userType || 'free',
            type: userType || 'free',
            expiresAt: null,
            autoRenew: false,
            price: 0,
            billingCycle: 'monthly'
        };

        let userSubscription = null;

        if (userType === 'premium') {
            userSubscription = await PremiumUser.findOne({
                where: { Username: username },
                include: [{ model: Subscription }]
            });
        }

        if (userSubscription && userSubscription.Subscription) {
            const sub = userSubscription.Subscription;

            // Check expiration
            if (new Date(userSubscription.subscriptionEnd) < new Date()) {
                // Expired! Downgrade to free.

                await UserLogin.update({ UserType: 'free' }, { where: { Username: username } });
                await PremiumUser.update({ isActive: false }, { where: { Username: username } });
                await Subscription.update({ status: 'expired' }, { where: { subscriptionId: sub.subscriptionId } });

                data.isActive = false;
                data.plan = 'FREE';
                data.type = 'free';
                data.status = 'expired';
            } else {
                data.expiresAt = userSubscription.subscriptionEnd;
                data.price = parseFloat(sub.price);
                data.billingCycle = sub.duration;
                data.planType = sub.planName;
                data.status = sub.status;
                data.autoRenew = userSubscription.autoRenew;
            }
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscription status' });
    }
};

// Create or Upgrade Subscription
exports.createSubscription = async (req, res) => {
    try {
        const username = req.user.Username;
        const { planId, billingCycle } = req.body; // planId e.g. 'premium_monthly' or 'premium_quarterly'

        // Determine price and duration based on input
        let price = 50;
        let duration = 'monthly';
        let planName = 'premium';

        if (planId === 'premium_quarterly' || billingCycle === 'quarterly') {
            price = 150;
            duration = 'quarterly';
        }

        // Check if user exists
        const user = await UserLogin.findByPk(username);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Create Subscription Record
        const newSubscription = await Subscription.create({
            planName: planName,
            price: price,
            duration: duration,
            status: 'active',
            features: {
                searchLimit: -1,
                exportLimit: duration === 'quarterly' ? 3000 : 1000
            },
            popular: duration === 'quarterly'
        });

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (duration === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 3);
        }

        // Update User Type and Link Subscription
        await user.update({ UserType: 'premium' });

        // Update or Create PremiumUser record
        let premiumUser = await PremiumUser.findOne({ where: { Username: username } });

        let finalStartDate = startDate;
        let finalEndDate = endDate;

        if (premiumUser && premiumUser.isActive) {
            // If active, extend from current end date
            // But only if staying on same plan type? Or just add time?
            // Requirement: "if somebody buys another plan while one is active make a logic to update the plan validity as per the plan purchased"
            // We will add the new duration to the existing end date.

            // Check if existing plan is expired (just in case isActive was stale)
            if (new Date(premiumUser.subscriptionEnd) > new Date()) {
                finalStartDate = premiumUser.subscriptionStart; // Keep original start
                const currentEnd = new Date(premiumUser.subscriptionEnd);

                // Add duration to currentEnd
                const extendedEnd = new Date(currentEnd);
                if (duration === 'monthly') {
                    extendedEnd.setMonth(extendedEnd.getMonth() + 1);
                } else {
                    extendedEnd.setMonth(extendedEnd.getMonth() + 3);
                }
                finalEndDate = extendedEnd;
            }
        }

        if (premiumUser) {
            await premiumUser.update({
                subscriptionId: newSubscription.subscriptionId,
                subscriptionStart: finalStartDate,
                subscriptionEnd: finalEndDate,
                isActive: true,
                paymentStatus: 'paid', // Assuming instant payment
                lastPaymentDate: new Date(),
                nextBillingDate: finalEndDate
            });
        } else {
            await PremiumUser.create({
                Username: username,
                subscriptionId: newSubscription.subscriptionId,
                subscriptionStart: finalStartDate,
                subscriptionEnd: finalEndDate,
                isActive: true,
                paymentStatus: 'paid',
                lastPaymentDate: new Date(),
                nextBillingDate: finalEndDate
            });
        }

        // Generate Invoice
        const invoiceId = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        await Invoice.create({
            id: invoiceId, // Manual ID required
            Username: username,
            amount: price,
            date: startDate,
            status: 'paid', // Assuming instant payment for now
            description: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan - ${duration.charAt(0).toUpperCase() + duration.slice(1)}`
        });

        // Cleanup FreeUser record if it exists
        await FreeUser.destroy({ where: { Username: username } });

        // Generate a fresh token with updated UserType
        const token = jwt.sign(
            { id: user.Username, userType: 'premium' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Subscription created successfully',
            data: {
                token: token, // Nest token in data for frontend handleResponse wrapper
                subscriptionId: newSubscription.subscriptionId,
                plan: planName,
                duration: duration,
                price: price,
                expiresAt: endDate
            }
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to create subscription' });
    }
};

// Cancel Subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const username = req.user.Username;
        const userType = req.user.UserType;

        if (userType === 'free') {
            return res.status(400).json({ success: false, error: 'No active subscription to cancel' });
        }

        let userSubscription = null;
        if (userType === 'premium') {
            userSubscription = await PremiumUser.findOne({ where: { Username: username } });
        }

        if (userSubscription) {
            // Mark as inactive immediately or at end of period? 
            // Requirement says "remove auto renewal", ensuring cancel connects to backend.
            // Usually valid until end date.

            // We'll update the Subscription status if linked
            if (userSubscription.subscriptionId) {
                await Subscription.update(
                    { status: 'cancelled' },
                    { where: { subscriptionId: userSubscription.subscriptionId } }
                );
            }

            // We keep UserType as premium until expiration, handled by a cron job usually.
            // For now, we just acknowledge the cancellation request.
        }

        res.json({
            success: true,
            message: 'Subscription cancelled. You will retain access until the end of your billing period.'
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
    }
};

// Start Trial (Placeholder/Basic implementation)
exports.startTrial = async (req, res) => {
    // Basic implementation if needed, otherwise just return success
    res.json({ success: true, message: 'Trial started' });
};

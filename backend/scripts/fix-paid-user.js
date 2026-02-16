const { Sequelize } = require('sequelize');
const config = require('c:/Users/nyash/99sellers/backend/config/config.js');
const { UserLogin, PremiumUser, Subscription, sequelize } = require('../models');

async function fixSpecificUser() {
    try {
        console.log('Starting Fix for paid@test.com...');

        await sequelize.authenticate();

        const email = 'paid@test.com';
        const user = await UserLogin.findOne({ where: { Email: email } });

        if (!user) {
            console.log(`User ${email} not found.`);
            // Create if missing? For now just exit.
            return;
        }

        console.log(`User found: ${user.Username} (${user.UserType})`);

        // Force UserType to premium
        if (user.UserType !== 'premium') {
            await user.update({ UserType: 'premium' });
            console.log('Updated UserType to premium.');
        }

        // Get/Create Subscription
        let premiumPlan = await Subscription.findOne({ where: { planName: 'premium', duration: 'monthly' } });
        if (!premiumPlan) {
            premiumPlan = await Subscription.create({
                planName: 'premium',
                price: 50.00,
                duration: 'monthly',
                status: 'active',
                popular: false,
                features: { searchLimit: -1 }
            });
            console.log('Created default premium plan.');
        }

        // Fix PremiumUser record
        let premiumRecord = await PremiumUser.findOne({ where: { Username: user.Username } });

        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (!premiumRecord) {
            await PremiumUser.create({
                Username: user.Username,
                subscriptionId: premiumPlan.subscriptionId,
                subscriptionStart: now,
                subscriptionEnd: nextMonth,
                paymentStatus: 'paid',
                autoRenew: true,
                isActive: true
            });
            console.log('Created PremiumUser record.');
        } else {
            await premiumRecord.update({
                subscriptionId: premiumPlan.subscriptionId,
                subscriptionStart: now,
                subscriptionEnd: nextMonth,
                paymentStatus: 'paid',
                autoRenew: true
            });
            console.log('Updated existing PremiumUser record.');
        }

        console.log('Fix for paid@test.com completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixSpecificUser();

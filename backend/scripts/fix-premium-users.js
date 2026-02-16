const { Sequelize } = require('sequelize');
const config = require('../config/config.js');
const { UserLogin, PremiumUser, Subscription, sequelize } = require('../models');

async function fixPremiumUsers() {
    try {
        console.log('Starting Premium User Data Fix...');

        // Authenticate
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Find all users with UserType = 'premium'
        const premiumUsers = await UserLogin.findAll({
            where: { UserType: 'premium' }
        });

        console.log(`Found ${premiumUsers.length} users with 'premium' UserType.`);

        // Ensure a default Premium Subscription plan exists
        let premiumPlan = await Subscription.findOne({ where: { planName: 'premium', duration: 'monthly' } });
        if (!premiumPlan) {
            console.log('Creating default Premium Subscription plan...');
            premiumPlan = await Subscription.create({
                planName: 'premium',
                price: 50.00,
                duration: 'monthly',
                status: 'active',
                features: {
                    searchLimit: -1,
                    exportLimit: 1000,
                    fullDataAccess: true
                },
                popular: false
            });
            console.log(`Created Subscription Plan ID: ${premiumPlan.subscriptionId}`);
        } else {
            console.log(`Using existing Subscription Plan ID: ${premiumPlan.subscriptionId}`);
        }

        for (const user of premiumUsers) {
            console.log(`Processing user: ${user.Username}`);

            // Check if they have a PremiumUser record
            let premiumRecord = await PremiumUser.findOne({ where: { Username: user.Username } });

            if (!premiumRecord) {
                console.log(` - Missing PremiumUser record. Creating...`);

                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

                await PremiumUser.create({
                    Username: user.Username,
                    subscriptionId: premiumPlan.subscriptionId,
                    subscriptionStart: startDate,
                    subscriptionEnd: endDate,
                    paymentStatus: 'paid',
                    autoRenew: true,
                    isActive: true
                });
                console.log(` - Created PremiumUser record for ${user.Username}`);
            } else {
                console.log(` - PremiumUser record exists.`);

                // Optional: Check if subscriptionId is valid/linked?
                if (!premiumRecord.subscriptionId) {
                    console.log(` - Fixing missing subscriptionId...`);
                    premiumRecord.subscriptionId = premiumPlan.subscriptionId;
                    await premiumRecord.save();
                }
            }
        }

        console.log('Fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing premium users:', error);
        process.exit(1);
    }
}

fixPremiumUsers();

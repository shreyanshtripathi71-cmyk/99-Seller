const { sequelize, UserLogin, Subscription, PremiumUser, Invoice, PaymentMethod } = require('./models');

async function fixAndSeedData() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const username = 'paid@test.com';
        const user = await UserLogin.findByPk(username);

        if (!user) {
            console.error('User paid@test.com not found!');
            return;
        }

        // 1. Fix Subscription
        let premiumUser = await PremiumUser.findOne({
            where: { Username: username },
            include: [{ model: Subscription }]
        });

        if (!premiumUser) {
            console.log('Creating PremiumUser record...');
            premiumUser = await PremiumUser.create({
                Username: username,
                isActive: true,
                subscriptionStart: new Date(),
                subscriptionEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                paymentStatus: 'paid',
                lastPaymentDate: new Date(),
                nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                usageStats: {}
            });
        }

        let subId = premiumUser.subscriptionId;
        if (!subId) {
            // Create new subscription if missing
            const sub = await Subscription.create({
                planName: 'premium',
                price: 50.00,
                duration: 'monthly',
                status: 'active',
                features: { searchLimit: -1, exportLimit: 1000 },
                description: 'Premium Monthly Plan'
            });
            subId = sub.subscriptionId;
            await premiumUser.update({
                subscriptionId: subId,
                paymentStatus: 'paid',
                lastPaymentDate: new Date(),
                nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            });
        } else {
            // Update existing
            await Subscription.update({
                planName: 'premium',
                price: 50.00,
                duration: 'monthly',
                status: 'active',
                features: { searchLimit: -1, exportLimit: 1000 },
                description: 'Premium Monthly Plan'
            }, { where: { subscriptionId: subId } });

            // Also ensure PremiumUser has required fields if they were null before
            await premiumUser.update({
                paymentStatus: 'paid',
                lastPaymentDate: new Date(),
                nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                usageStats: premiumUser.usageStats || {}
            });
        }
        console.log('Fixed Subscription to $50 Monthly');

        // 2. Seed Invoices
        const invoices = await Invoice.findAll({ where: { Username: username } });
        if (invoices.length === 0) {
            console.log('Seeding Invoices...');
            await Invoice.bulkCreate([
                {
                    id: 'inv_' + Date.now(),
                    Username: username,
                    amount: 50.00,
                    date: new Date(),
                    status: 'paid',
                    description: 'Premium Plan - Monthly (Feb 2026)'
                },
                {
                    id: 'inv_' + (Date.now() - 1000),
                    Username: username,
                    amount: 50.00,
                    date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                    status: 'paid',
                    description: 'Premium Plan - Monthly (Jan 2026)'
                }
            ]);
        } else {
            console.log('Invoices already exist.');
        }

        // 3. Seed Payment Method
        const methods = await PaymentMethod.findAll({ where: { Username: username } });
        if (methods.length === 0) {
            console.log('Seeding Payment Method...');
            await PaymentMethod.create({
                id: 'pm_' + Date.now(),
                Username: username,
                type: 'card',
                provider: 'stripe',
                last4: '4242',
                brand: 'Visa',
                expiryMonth: 12,
                expiryYear: 2028,
                isDefault: true
            });
        } else {
            console.log('Payment Methods already exist.');
        }

        console.log('Data fix complete!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixAndSeedData();

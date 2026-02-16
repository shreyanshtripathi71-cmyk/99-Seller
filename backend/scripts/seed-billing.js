const { Sequelize } = require('sequelize');
const { sequelize, UserLogin, PremiumUser, Subscription, Invoice, PaymentMethod } = require('./models');
const bcrypt = require('bcryptjs');

async function seedBillingData() {
    try {
        console.log('Syncing database schema...');
        await sequelize.sync({ alter: true });
        console.log('Database synced!');

        console.log('Seeding billing data...');

        // 1. Find or create a test user
        const email = 'test@example.com';
        let user = await UserLogin.findOne({ where: { Email: email } });

        if (!user) {
            console.log('Creating test user...');
            const hashedPassword = await bcrypt.hash('password123', 10);
            user = await UserLogin.create({
                Username: email,
                Email: email,
                Password: hashedPassword,
                FirstName: 'Test',
                LastName: 'User',
                UserType: 'premium'
            });
        } else {
            console.log('Test user exists, updating to premium...');
            await user.update({ UserType: 'premium' });
        }

        // 2. Ensure subscription plan exists
        let plan = await Subscription.findOne({ where: { planName: 'premium' } });
        if (!plan) {
            console.log('Creating premium plan...');
            plan = await Subscription.create({
                planName: 'premium',
                price: 99.00,
                duration: 'monthly',
                status: 'active',
                description: 'Premium Plan',
                popular: true
            });
        }

        // 3. Create/Update PremiumUser record
        let premiumUser = await PremiumUser.findOne({ where: { Username: email } });
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (!premiumUser) {
            console.log('Creating PremiumUser record...');
            await PremiumUser.create({
                Username: email,
                subscriptionId: plan.subscriptionId,
                subscriptionStart: now,
                subscriptionEnd: nextMonth,
                paymentStatus: 'paid',
                autoRenew: true
            });
        } else {
            console.log('Updating PremiumUser record...');
            await premiumUser.update({
                subscriptionId: plan.subscriptionId,
                paymentStatus: 'paid',
                subscriptionEnd: nextMonth
            });
        }

        // 4. Create Invoices
        console.log('Creating invoices...');
        await Invoice.destroy({ where: { Username: email } }); // Clear old ones

        const invoices = [
            {
                id: 'INV-2024-001',
                Username: email,
                amount: 99.00,
                status: 'paid',
                date: new Date(now.getFullYear(), now.getMonth() - 2, 15),
                description: 'Premium Plan - Monthly'
            },
            {
                id: 'INV-2024-002',
                Username: email,
                amount: 99.00,
                status: 'paid',
                date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
                description: 'Premium Plan - Monthly'
            },
            {
                id: 'INV-2024-003',
                Username: email,
                amount: 99.00,
                status: 'pending',
                date: new Date(now.getFullYear(), now.getMonth(), 15),
                description: 'Premium Plan - Monthly'
            }
        ];

        for (const inv of invoices) {
            await Invoice.create(inv);
        }

        // 5. Create Payment Methods
        console.log('Creating payment methods...');
        await PaymentMethod.destroy({ where: { Username: email } }); // Clear old ones

        await PaymentMethod.create({
            id: 'pm_' + Date.now(),
            Username: email,
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true
        });

        console.log('Billing data seeded successfully!');
        console.log('Test User: test@example.com / password123');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedBillingData();

const { sequelize, UserLogin, Property, Subscription, Auction, CrawlerRun, Errors, Poppin, Site, AdminActivity, MotiveTypes, PremiumUser } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('Starting logical seed...');

        // Sync all models - Force sync to ensure fresh relations
        await sequelize.sync({ force: true });
        console.log('Database tables reset and synced.');

        const password = await bcrypt.hash('password123', 10);

        // 1. Seed Motive Types
        const motiveTypes = [
            { code: 'FOR', name: 'Foreclosure' },
            { code: 'AUC', name: 'Auction' },
            { code: 'TAX', name: 'Tax Lien' },
            { code: 'PRO', name: 'Probate' }
        ];
        const createdMotives = {};
        for (const m of motiveTypes) {
            const created = await MotiveTypes.create(m);
            createdMotives[m.name] = created.id;
        }
        console.log('Motive Types seeded.');

        // 2. Seed Subscriptions
        const subscriptions = [
            { planName: 'premium', price: 29.99, duration: 'monthly', status: 'active' },
            { planName: 'free', price: 0.00, duration: 'monthly', status: 'active' }
        ];
        const createdSubs = {};
        for (const sub of subscriptions) {
            const created = await Subscription.create(sub);
            createdSubs[sub.planName] = created.subscriptionId;
        }
        console.log('Subscriptions seeded.');

        // 3. Seed Users & Links
        const admin = await UserLogin.create({
            Username: 'admin@test.com', Email: 'admin@test.com', Password: password, FirstName: 'Admin', LastName: 'User', UserType: 'admin'
        });

        const premiumUser = await UserLogin.create({
            Username: 'premium@test.com', Email: 'premium@test.com', Password: password, FirstName: 'Premium', LastName: 'User', UserType: 'premium'
        });
        await PremiumUser.create({
            Username: premiumUser.Username,
            subscriptionId: createdSubs['premium'],
            subscriptionEnd: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
            paymentStatus: 'paid'
        });

        await UserLogin.create({
            Username: 'free@test.com', Email: 'free@test.com', Password: password, FirstName: 'Free', LastName: 'User', UserType: 'free'
        });

        // 4. Seed Historical Data for Trends
        for (let i = 5; i > 0; i--) {
            const histDate = new Date();
            histDate.setMonth(histDate.getMonth() - i);
            histDate.setDate(15);

            const histUser = await UserLogin.create({
                Username: `user_${i}@test.com`,
                Email: `user_${i}@test.com`,
                Password: password,
                FirstName: 'Historical',
                LastName: 'User',
                UserType: 'premium',
                createdAt: histDate
            });

            await PremiumUser.create({
                Username: histUser.Username,
                subscriptionId: createdSubs['premium'],
                subscriptionEnd: new Date(histDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                paymentStatus: 'paid',
                createdAt: histDate
            });
        }
        console.log('Historical users seeded.');

        // 5. Seed Expired for Testing
        const expiredSub = await Subscription.create({ planName: 'premium', price: 29.99, duration: 'monthly', status: 'expired' });
        const expiredUser = await UserLogin.create({
            Username: 'expired@test.com', Email: 'expired@test.com', Password: password, FirstName: 'Expired', LastName: 'User', UserType: 'premium'
        });
        await PremiumUser.create({
            Username: expiredUser.Username,
            subscriptionId: expiredSub.subscriptionId,
            subscriptionEnd: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            paymentStatus: 'paid'
        });

        console.log('Expired users seeded.');

        console.log('Users and Active Subscriptions linked.');

        // 4. Seed Properties with Motive Types
        const propertyData = [
            { PStreetAddr1: '123 Luxury Ln', Pcity: 'Miami', Pstate: 'FL', Pzip: '33101', Pcounty: 'Miami-Dade', motive_type_id: createdMotives['Foreclosure'], PTotAppraisedAmt: '1250000' },
            { PStreetAddr1: '456 Condo Ct', Pcity: 'Miami', Pstate: 'FL', Pzip: '33102', Pcounty: 'Miami-Dade', motive_type_id: createdMotives['Auction'], PTotAppraisedAmt: '450000' },
            { PStreetAddr1: '789 Business Blvd', Pcity: 'Miami', Pstate: 'FL', Pzip: '33103', Pcounty: 'Miami-Dade', motive_type_id: createdMotives['Foreclosure'], PTotAppraisedAmt: '2800000' },
            { PStreetAddr1: '101 Multi Unit', Pcity: 'Miami', Pstate: 'FL', Pzip: '33104', Pcounty: 'Miami-Dade', motive_type_id: createdMotives['Probate'], PTotAppraisedAmt: '890000' }
        ];

        for (const pData of propertyData) {
            await Property.create(pData);
        }
        console.log('Properties seeded with Motive Types.');

        // 5. Seed Activities
        await AdminActivity.create({ type: 'login', message: 'Admin logged in' });
        await AdminActivity.create({ type: 'user', message: 'User premium@test.com upgraded plan' });
        console.log('Recent activities seeded.');

        console.log('Logical seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();

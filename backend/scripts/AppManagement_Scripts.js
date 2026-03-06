const {
    sequelize, UserLogin, Property, Subscription, Auction,
    MotiveTypes, PremiumUser, SiteContent, Proaddress,
    Owner, Loan, Probate, Divorce, TaxLien, Eviction,
    Violation, Invoice, PaymentMethod, Feedback
} = require('../models');
const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
const command = args[0];

const usage = () => {
    console.log(`
Usage: node scripts/AppManagement_Scripts.js <command> [args]
Commands:
  sync          Sync database schema (alter: true)
  clear         Clear all transactional data (keeps users/configs)
  seed-all      Run full system seed (Sync + Motives + Subs + Admin)
  seed-billing  Seed test billing data for test@example.com
  seed-content  Seed UI/Site content templates
  make-admin    <email> - Promote user to admin
  update-prices Update subscription pricing in DB
    `);
};

const run = async () => {
    try {
        switch (command) {
            case 'sync':
                console.log('[MGMT] Syncing database...');
                await sequelize.sync({ alter: true });
                console.log('[MGMT] Sync complete.');
                break;

            case 'clear':
                console.log('[MGMT] Clearing transactional data...');
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
                const models = [Property, Proaddress, Owner, Loan, Auction, Probate, Divorce, TaxLien, Eviction, Violation, Invoice, Feedback];
                for (const model of models) if (model) await model.destroy({ where: {}, truncate: true });
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
                console.log('[MGMT] Cleanup complete.');
                break;

            case 'seed-all':
                console.log('[MGMT] Starting full seed...');
                await sequelize.sync({ force: true });
                const hash = await bcrypt.hash('password123', 10);
                await UserLogin.create({ Username: 'admin@test.com', Email: 'admin@test.com', Password: hash, FirstName: 'Admin', LastName: 'User', UserType: 'admin' });
                const motives = ['FOR', 'AUC', 'TAX', 'PRO'];
                for (const m of motives) await MotiveTypes.create({ code: m, name: m });
                await Subscription.create({ planName: 'premium', price: 29.99, duration: 'monthly', status: 'active' });
                await Subscription.create({ planName: 'free', price: 0, duration: 'monthly', status: 'active' });
                console.log('[MGMT] Seed complete. Admin: admin@test.com / password123');
                break;

            case 'make-admin':
                const email = args[1] || 'test@example.com';
                const user = await UserLogin.findOne({ where: { Email: email } });
                if (user) {
                    await user.update({ UserType: 'admin' });
                    console.log(`[MGMT] User ${email} promoted.`);
                } else console.log('[MGMT] User not found.');
                break;

            case 'seed-content':
                console.log('[MGMT] Seeding content...');
                const content = { page_home: { hero: { title: '99Sellers' } } };
                await SiteContent.findOrCreate({ where: { key: 'page_home' }, defaults: { value: content, contentType: 'json' } });
                console.log('[MGMT] Content seed complete.');
                break;

            default:
                usage();
        }
    } catch (err) {
        console.error('[MGMT] Error:', err);
    } finally {
        await sequelize.close();
    }
};

if (!command) usage();
else run();

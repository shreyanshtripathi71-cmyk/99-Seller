const { sequelize, UserLogin, Subscription, PremiumUser, Invoice, PaymentMethod } = require('./models');
const fs = require('fs');

async function inspectData() {
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    try {
        await sequelize.authenticate();
        log('Connected to DB');

        const user = await UserLogin.findOne({ where: { Username: 'paid@test.com' } });
        if (!user) {
            log('User not found!');
        } else {
            log('User: ' + JSON.stringify(user.toJSON()));
        }

        const premiumUser = await PremiumUser.findOne({
            where: { Username: 'paid@test.com' },
            include: [{ model: Subscription }]
        });

        if (premiumUser) {
            log('PremiumUser: ' + JSON.stringify(premiumUser.toJSON(), null, 2));
        } else {
            log('PremiumUser not found');
        }

        const invoices = await Invoice.findAll({ where: { Username: 'paid@test.com' } });
        log(`Found ${invoices.length} invoices`);
        invoices.forEach(inv => log(JSON.stringify(inv.toJSON())));

        const methods = await PaymentMethod.findAll({ where: { Username: 'paid@test.com' } });
        log(`Found ${methods.length} payment methods`);
        methods.forEach(m => log(JSON.stringify(m.toJSON())));

    } catch (error) {
        log('Error: ' + error.message);
    } finally {
        await sequelize.close();
        fs.writeFileSync('inspect_output.txt', output);
    }
}

inspectData();

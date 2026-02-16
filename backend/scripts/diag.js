const { PremiumUser, EnterpriseUser, Subscription } = require('./models');

async function test() {
    try {
        const premiumSubs = await PremiumUser.findAll({
            include: [{
                model: Subscription,
                attributes: ['price', 'status']
            }],
            raw: true
        });
        console.log('Premium Subs samples:', JSON.stringify(premiumSubs.slice(0, 1), null, 2));

        const entSubs = await EnterpriseUser.findAll({
            include: [{
                model: Subscription,
                attributes: ['price', 'status']
            }],
            raw: true
        });
        console.log('Enterprise Subs samples:', JSON.stringify(entSubs.slice(0, 1), null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();

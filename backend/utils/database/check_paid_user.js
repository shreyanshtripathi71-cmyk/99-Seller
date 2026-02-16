const { sequelize, UserLogin, PremiumUser, Subscription } = require('./models');

async function checkUser() {
    try {
        const username = 'paid@test.com';
        console.log(`Checking DB for: ${username}`);

        // Check UserLogin
        const user = await UserLogin.findOne({ where: { Username: username } });
        console.log('UserLogin:', user ? JSON.stringify(user, null, 2) : 'NOT FOUND');

        // Check PremiumUser (Case Insensitive Manual Check)
        const premium = await PremiumUser.findAll();
        const foundPremium = premium.find(p => p.Username.toLowerCase() === username.toLowerCase());

        console.log('PremiumUser (inc. case variants):', foundPremium ? JSON.stringify(foundPremium, null, 2) : 'NOT FOUND');

        // Check Subscription
        if (foundPremium) {
            const sub = await Subscription.findOne({ where: { subscriptionId: foundPremium.subscriptionId } });
            console.log('Subscription:', sub ? JSON.stringify(sub, null, 2) : 'NOT FOUND (or null ID)');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUser();


const { UserLogin, PremiumUser, Subscription } = require('./models');

async function checkUsers() {
    try {
        await require('./models').sequelize.authenticate();
        console.log('Connected to DB.');

        // Get all users, limit 10
        const users = await UserLogin.findAll({
            attributes: ['Username', 'Email', 'UserType'],
            limit: 10
        });

        console.log('\n--- Recent Users (Unsorted) ---');
        users.forEach(u => {
            console.log(`User: ${u.Email} | Type: ${u.UserType}`);
        });

        const premiums = await PremiumUser.findAll({
            include: [{ model: Subscription }]
        });

        console.log('\n--- Premium Records ---');
        premiums.forEach(p => {
            console.log(`User: ${p.Username} | Active: ${p.isActive} | Plan: ${p.Subscription?.planName} | End: ${p.subscriptionEnd}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await require('./models').sequelize.close();
    }
}

checkUsers();

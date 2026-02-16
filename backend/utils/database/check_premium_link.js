
const { UserLogin, PremiumUser, Subscription } = require('./models');

async function checkLinks() {
    try {
        await require('./models').sequelize.authenticate();
        console.log('Connected to DB.');

        // Get all users who have a 'premium' UserType or an entry in PremiumUser
        const users = await UserLogin.findAll({
            where: {
                // Check for potential mismatches: Premium UserType OR exists in PremiumUser table
            },
            include: [{
                model: PremiumUser,
                include: [{ model: Subscription }]
            }],
            limit: 20
        });

        console.log('\n--- User Linkage Check ---');
        if (users.length === 0) console.log("No users found.");

        users.forEach(u => {
            const pu = u.PremiumUser;
            const sub = pu?.Subscription;

            console.log(`\nUser: ${u.Email}`);
            console.log(`  UserLogin.UserType: ${u.UserType}`);
            console.log(`  PremiumUser Record: ${pu ? 'EXISTS' : 'MISSING'}`);

            if (pu) {
                console.log(`    isActive: ${pu.isActive}`);
                console.log(`    End Date: ${pu.subscriptionEnd}`);
                console.log(`    Subscription ID linked: ${pu.subscriptionId}`);
            }

            console.log(`  Subscription Record: ${sub ? 'EXISTS' : 'MISSING'}`);
            if (sub) {
                console.log(`    Plan: ${sub.planName}`);
                console.log(`    Status: ${sub.status}`);
            }

            // Diagnosis
            if (u.UserType === 'premium' && !pu) {
                console.error('  [CRITICAL LINK ERROR]: User is marked premium but has no PremiumUser record!');
            }
            if (pu && !sub) {
                console.error('  [CRITICAL LINK ERROR]: PremiumUser record exists but links to non-existent Subscription!');
            }
            if (u.UserType === 'free' && pu && pu.isActive) {
                console.error('  [SYNC ERROR]: User is marked free but has active PremiumUser record!');
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await require('./models').sequelize.close();
    }
}

checkLinks();

const { UserLogin } = require('./models');

async function makeAdmin() {
    try {
        const user = await UserLogin.findOne({ where: { Email: 'test@example.com' } });
        if (user) {
            await user.update({ UserType: 'admin' });
            console.log('User test@example.com promoted to admin.');
        } else {
            console.log('User not found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
}

makeAdmin();

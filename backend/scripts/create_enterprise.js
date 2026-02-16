const bcrypt = require('bcryptjs');
const { sequelize, UserLogin, EnterpriseUser, Subscription } = require('./models');

async function createEnterpriseUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Get existing subscription
    let subscription = await Subscription.findOne();
    
    if (!subscription) {
      console.log('Creating subscription...');
      subscription = await Subscription.create({
        planName: 'enterprise',
        price: 299.00,
        duration: 'yearly',
        status: 'active',
        description: 'Enterprise Plan'
      });
      console.log('✓ Subscription created');
    }
    
    await UserLogin.create({
      Username: 'enterprise_user',
      FirstName: 'Enterprise',
      LastName: 'User',
      Email: 'enterprise@test.com',
      Password: hashedPassword,
      UserType: 'enterprise'
    });
    console.log('✓ Enterprise UserLogin created');
    
    await EnterpriseUser.create({
      Username: 'enterprise_user',
      subscriptionId: subscription.subscriptionId,
      companyName: 'Test Company',
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      paymentStatus: 'paid'
    });
    console.log('✓ Enterprise user profile created');
    
    console.log('\n✅ Enterprise user ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createEnterpriseUser();

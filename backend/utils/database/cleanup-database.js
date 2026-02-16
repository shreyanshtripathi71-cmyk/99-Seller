const { sequelize } = require('./models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Drop enterprise_users table
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.query('DROP TABLE IF EXISTS enterprise_users');
        await sequelize.query('DELETE FROM user_login WHERE UserType = "enterprise"');
        await sequelize.query('DELETE FROM subscriptions WHERE planName = "enterprise"');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✓ Enterprise users table dropped');
        console.log('✓ Enterprise user_login records deleted');
        console.log('✓ Enterprise subscript plans deleted');
        console.log('\n✅ Database cleanup complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
})();

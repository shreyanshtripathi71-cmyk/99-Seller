const { UserLogin, Property, Loan, Owner, Proaddress } = require('./models');

async function verifyCounts() {
    try {
        const userCount = await UserLogin.count();
        const propertyCount = await Property.count();
        const loanCount = await Loan.count();
        const ownerCount = await Owner.count();
        const proaddressCount = await Proaddress.count();

        console.log('--- DATABASE VERIFICATION ---');
        console.log('User Count:', userCount);
        console.log('Property Count:', propertyCount);
        console.log('Loan Count:', loanCount);
        console.log('Owner Count:', ownerCount);
        console.log('Proaddress Count:', proaddressCount);
        console.log('-----------------------------');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        process.exit();
    }
}

verifyCounts();

require('dotenv').config();
const { Property, MotiveTypes, Proaddress, Owner, Loan, Auction } = require('./models');

const runTest = async () => {
    try {
        console.log('1. Fetching with motiveType...');
        const p1 = await Property.findByPk(12, { include: [{ model: MotiveTypes, as: 'motiveType' }] });
        console.log('   Success.');

        console.log('2. Fetching with proaddress...');
        const p2 = await Property.findByPk(12, { include: [{ model: Proaddress, as: 'proaddress' }] });
        console.log('   Success.');

        console.log('3. Fetching with owners...');
        const p3 = await Property.findByPk(12, { include: [{ model: Owner, as: 'owners' }] });
        console.log('   Success.');

        console.log('4. Fetching with loans...');
        const p4 = await Property.findByPk(12, { include: [{ model: Loan, as: 'loans' }] });
        console.log('   Success.');

        console.log('5. Fetching with auctions...');
        const p5 = await Property.findByPk(12, { include: [{ model: Auction, as: 'auctions' }] });
        console.log('   Success.');

        console.log('\nAll individual includes passed.');

        console.log('6. Fetching with ALL includes...');
        const p6 = await Property.findByPk(12, {
            include: [
                { model: MotiveTypes, as: 'motiveType' },
                { model: Proaddress, as: 'proaddress' },
                { model: Owner, as: 'owners' },
                { model: Loan, as: 'loans' },
                { model: Auction, as: 'auctions' }
            ]
        });
        console.log('   Success.');

    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        process.exit();
    }
};

runTest();

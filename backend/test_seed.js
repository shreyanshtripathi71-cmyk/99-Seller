const { Proaddress } = require('./models');

async function test() {
    try {
        await Proaddress.create({
            PStreetNum: '1',
            PStreetName: 'TEST ST',
            Pcity: 'TEST',
            PState: 'TS',
            Pzip: '00000',
            PMotiveType: 'Foreclosure'
        });
        console.log('✅ Minimal Proaddress created');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error details:');
        if (e.errors) {
            e.errors.forEach(err => console.error(`Field: ${err.path}, Message: ${err.message}`));
        } else {
            console.error(e.message);
        }
        process.exit(1);
    }
}
test();

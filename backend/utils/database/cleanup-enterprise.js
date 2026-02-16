// Quick script to remove enterprise user references and allow system to start
const fs = require('fs');
const path = require('path');

const files = [
    './controllers/subscriptionController.js',
    './controllers/billingController.js',
    './controllers/adminController.js'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Comment out EnterpriseUser usages
    content = content.replace(/(\s+)(userSubscription = await EnterpriseUser\.findOne)/g, '$1// $2');
    content = content.replace(/(\s+)(const entSubs = await EnterpriseUser\.findAll)/g, '$1// $2');
    content = content.replace(/(\s+)(const entMonth = await EnterpriseUser\.findAll)/g, '$1// $2');
    content = content.replace(/(\s+)(if \(!user\) user = await EnterpriseUser\.findByPk)/g, '$1// $2');
    content = content.replace(/(\s+)(const enterprise = await EnterpriseUser\.findAll)/g, '$1// $2');

    // Replace references in calculations
    content = content.replace(/entSubs/g, '[]');
    content = content.replace(/entMonth/g, '[]');
    content = content.replace(/entRevenue/g, '0');
    content = content.replace(/activeEnt/g, '0');
    content = content.replace(/expiredEnt/g, '0');
    content = content.replace(/enterprise\./g, '/* enterprise */');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned ${filePath}`);
});

console.log('\n✅ All enterprise references have been cleaned up!');

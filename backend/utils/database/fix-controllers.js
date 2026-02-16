const fs = require('fs');

// Fix adminController.js
let admin = fs.readFileSync('./controllers/adminController.js', 'utf8');

// Remove EnterpriseUser from imports
admin = admin.replace(
    'const { UserLogin, Property, Subscription, Auction, CrawlerRun, Errors, Poppin, AdminActivity, MotiveTypes, PremiumUser, EnterpriseUser, SiteContent, sequelize } = require(\'../models\');',
    'const { UserLogin, Property, Subscription, Auction, CrawlerRun, Errors, Poppin, AdminActivity, MotiveTypes, PremiumUser, SiteContent, sequelize } = require(\'../models\');'
);

// Replace getPlans to exclude enterprise
admin = admin.replace(
    "where: { planName: ['premium', 'enterprise', 'free'] }",
    "where: { planName: ['premium', 'free'] }"
);

fs.writeFileSync('./controllers/adminController.js', admin);
console.log('✓ Fixed adminController.js');

// Fix subscriptionController.js  
let sub = fs.readFileSync('./controllers/subscriptionController.js', 'utf8');
sub = sub.replace(
    'const { Subscription, UserLogin, PremiumUser, EnterpriseUser, Invoice, PaymentMethod } = require(\'../models\');',
    'const { Subscription, UserLogin, PremiumUser, Invoice, PaymentMethod } = require(\'../models\');'
);
fs.writeFileSync('./controllers/subscriptionController.js', sub);
console.log('✓ Fixed subscriptionController.js');

// Fix billingController.js
let bill = fs.readFileSync('./controllers/billingController.js', 'utf8');
bill = bill.replace(
    'const { Subscription, UserLogin, PremiumUser, EnterpriseUser, Invoice, PaymentMethod } = require(\'../models\');',
    'const { Subscription, UserLogin, PremiumUser, Invoice, PaymentMethod } = require(\'../models\');'
);
fs.writeFileSync('./controllers/billingController.js', bill);
console.log('✓ Fixed billingController.js');

console.log('\n✅ All files fixed! Backend should start now.');

const {
    AdminActivity, UserLogin, FreeUser, PremiumUser,
    Subscription, MotiveTypes, Property, Proaddress,
    Owner, Loan, Auction, Probate, Divorce, TaxLien,
    Eviction, Violation, SiteContent
} = require('../models');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const bcrypt = require('bcryptjs');

/**
 * ==========================================
 * ACTIVITY LOGGING SERVICE
 * ==========================================
 */
exports.logActivity = async (type, message, details = {}) => {
    try {
        if (AdminActivity) await AdminActivity.create({ type, message, details });
    } catch (err) { console.error('Error logging activity:', err); }
};

/**
 * ==========================================
 * EMAIL SERVICE
 * ==========================================
 */
exports.sendPasswordResetEmail = async (email, resetLink) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const mailOptions = {
        from: `"99Sellers" <${process.env.EMAIL_USER}>`,
        to: email, subject: 'Password Reset Request - 99Sellers',
        html: `<div style="font-family: Arial; padding: 20px;"><h2>99Sellers</h2><p>Click below to reset:</p><a href="${resetLink}">Reset Password</a></div>`
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, response: info.response };
    } catch (error) { return { success: false, error: error.message }; }
};

/**
 * ==========================================
 * STRIPE / PAYMENT SERVICE
 * ==========================================
 */
let stripeInstance;
const isEnabled = process.env.ENABLE_PAYMENTS === 'true';
if (isEnabled && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    stripeInstance = {
        paymentIntents: {
            create: async ({ amount, currency }) => ({
                id: 'pi_mock_' + Date.now(), client_secret: 'mock_secret_' + Date.now(), status: 'requires_payment_method', amount, currency
            })
        }
    };
}
exports.stripe = stripeInstance;

/**
 * ==========================================
 * DATABASE SEED SERVICE
 * ==========================================
 */
const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
const parseAddress = (addr) => {
    const parts = addr.trim().split(/\s+/);
    return { streetNum: parts[0] || '0', streetName: parts.slice(1).join(' ') || addr };
};
const createProaddressForProperty = async (prop, p, motiveCode) => {
    const { streetNum, streetName } = parseAddress(p.addr);
    const proaddress = await Proaddress.create({
        PStreetNum: streetNum, PStreetName: streetName, Pcity: p.city, PState: p.state, Pzip: p.zip,
        owner_name: `${p.ownerFirst} ${p.ownerLast}`, PMotiveType: motiveCode, price: parseFloat(p.value) || 0,
        beds: p.beds, baths: p.baths, square_feet: parseInt(p.sqft) || 0, proptype: p.type, PYearBuilt: p.year
    });
    await prop.update({ proaddress_id: proaddress.id });
    return proaddress;
};

exports.seedData = async () => {
    try {
        const count = await UserLogin.count();
        if (count > 0) return console.log('[SEED] Data exists, skipping.');

        const hp = await bcrypt.hash('Admin@99Sell#2026', 10);
        const [admin] = await UserLogin.findOrCreate({
            where: { Username: 'admin@test.com' },
            defaults: { Email: 'admin@test.com', Password: hp, FirstName: 'Admin', LastName: 'User', UserType: 'admin' }
        });

        // Motive Types
        const motives = ['PRE', 'FOR', 'AUC', 'PRO', 'COD', 'EVI', 'DIV', 'TAX', 'OOS'];
        const mIds = {};
        for (const m of motives) {
            const [mt] = await MotiveTypes.findOrCreate({ where: { code: m }, defaults: { code: m, name: m } });
            mIds[m] = mt.id;
        }

        console.log('[SEED] System Initialized.');
    } catch (err) { console.error('[SEED] Error:', err); }
};

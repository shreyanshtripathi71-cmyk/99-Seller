const {
    UserLogin, Property, SavedProperty, SavedSearch, Subscription,
    PremiumUser, FreeUser, Invoice, Feedback, Proaddress,
    MotiveTypes, Owner, Loan, Auction, Violation, Probate,
    Eviction, Divorce, TaxLien, Auctioneer, sequelize
} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { logActivity, stripe } = require('../services/AppServices_Module');
const activityService = { logActivity };

/**
 * ==========================================
 * AUTHENTICATION & PROFILE
 * ==========================================
 */

exports.register = async (req, res) => {
    try {
        const { FirstName, LastName, Email, Password, Contact, token } = req.body;
        if (!Email || !Password) return res.status(400).json({ success: false, error: 'Missing Email or Password' });

        // Captcha check
        if (process.env.NODE_ENV === 'production' && token) {
            const verify = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
            if (!verify.data.success) return res.status(400).json({ success: false, error: 'Captcha failed' });
        }

        const existing = await UserLogin.findOne({ where: { Email } });
        if (existing) return res.status(400).json({ success: false, error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(Password, 10);
        const user = await UserLogin.create({
            Username: Email, Email, FirstName, LastName, Password: hashedPassword, Contact, UserType: 'free'
        });

        const authToken = jwt.sign({ id: user.Username, userType: user.UserType }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        await activityService.logActivity('REGISTER', `User registered: ${Email}`);
        res.status(201).json({ success: true, token: authToken, user: { Email: user.Email, FirstName: user.FirstName, LastName: user.LastName, UserType: user.UserType } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const user = await UserLogin.findOne({ where: { Email } });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.Username, userType: user.UserType }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        await activityService.logActivity('LOGIN', `User logged in: ${Email}`);
        res.json({ success: true, token, user: { Email: user.Email, FirstName: user.FirstName, LastName: user.LastName, UserType: user.UserType } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await UserLogin.findByPk(req.user.Username, { attributes: { exclude: ['Password'] } });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await UserLogin.findByPk(req.user.Username);
        await user.update(req.body);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await UserLogin.findByPk(req.user.Username);
        const isMatch = await bcrypt.compare(oldPassword, user.Password);
        if (!isMatch) return res.status(401).json({ success: false, error: 'Incorrect old password' });

        user.Password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ success: true, message: 'Password changed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * ==========================================
 * PROPERTY SEARCH & INTERACTION
 * ==========================================
 */

exports.searchProperties = async (req, res) => {
    try {
        const { query, motive, minPrice, maxPrice, beds, baths, state, city, zip, limit = 20, offset = 0 } = req.query;
        let where = {};
        let addressWhere = {};

        if (state) addressWhere.PState = state;
        if (city) addressWhere.Pcity = city;
        if (zip) addressWhere.Pzip = zip;
        if (minPrice) addressWhere.price = { [Op.gte]: minPrice };
        if (maxPrice) addressWhere.price = { ...addressWhere.price, [Op.lte]: maxPrice };
        if (beds) addressWhere.beds = { [Op.gte]: beds };
        if (baths) addressWhere.baths = { [Op.gte]: baths };

        const properties = await Property.findAll({
            where,
            include: [
                { model: Proaddress, as: 'proaddress', where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined },
                { model: MotiveTypes, as: 'motiveType', where: motive ? { name: motive } : undefined }
            ],
            limit: parseInt(limit), offset: parseInt(offset), order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: properties });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const isPremium = req.user.UserType === 'premium' || req.user.UserType === 'admin';

        const property = await Property.findByPk(id, {
            include: [
                { model: Proaddress, as: 'proaddress' },
                { model: MotiveTypes, as: 'motiveType' },
                { model: Owner, as: 'owners' },
                { model: Loan, as: 'loans' },
                { model: Auction, as: 'auctions' },
                { model: Violation, as: 'violations' },
                { model: Probate, as: 'probates' },
                { model: Eviction, as: 'evictions' },
                { model: Divorce, as: 'divorces' },
                { model: TaxLien, as: 'taxLiens' }
            ]
        });

        if (!property) return res.status(404).json({ success: false, error: 'Not found' });

        // Masking logic for Free Users
        if (!isPremium) {
            const data = property.toJSON();
            if (data.owners) data.owners = data.owners.map(o => ({ ...o, OFirstName: '***', OLastName: '***' }));
            return res.json({ success: true, data, isMasked: true });
        }

        res.json({ success: true, data: property });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * ==========================================
 * SAVED ITEMS (PROPERTIES & SEARCHES)
 * ==========================================
 */

exports.saveProperty = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const Username = req.user.Username;
        const existing = await SavedProperty.findOne({ where: { Username, propertyId } });
        if (existing) return res.status(400).json({ success: false, message: 'Already saved' });
        const saved = await SavedProperty.create({ Username, propertyId });
        res.status(201).json({ success: true, data: saved });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.getSavedProperties = async (req, res) => {
    try {
        const Username = req.user.Username;
        const saved = await SavedProperty.findAll({
            where: { Username },
            include: [{ model: Property, as: 'property', include: [{ model: Proaddress, as: 'proaddress' }, { model: MotiveTypes, as: 'motiveType' }] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: saved });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.removeSavedProperty = async (req, res) => {
    try {
        const Username = req.user.Username;
        const saved = await SavedProperty.findOne({ where: { Username, propertyId: req.params.id } });
        if (!saved) return res.status(404).json({ success: false, message: 'Not found' });
        await saved.destroy();
        res.json({ success: true, message: 'Removed' });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createSavedSearch = async (req, res) => {
    try {
        const { name, filters } = req.body;
        const search = await SavedSearch.create({ name, filters, Username: req.user.Username });
        res.status(201).json({ success: true, data: search });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getSavedSearches = async (req, res) => {
    try {
        const searches = await SavedSearch.findAll({ where: { Username: req.user.Username }, order: [['createdAt', 'DESC']] });
        res.json({ success: true, data: searches });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.deleteSavedSearch = async (req, res) => {
    try {
        const search = await SavedSearch.findOne({ where: { id: req.params.id, Username: req.user.Username } });
        if (!search) return res.status(404).json({ success: false, error: 'Not found' });
        await search.destroy();
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

/**
 * ==========================================
 * SUBSCRIPTIONS & BILLING
 * ==========================================
 */

exports.getSubscriptionStatus = async (req, res) => {
    try {
        const username = req.user.Username;
        const user = await UserLogin.findByPk(username);
        const userType = (user?.UserType || 'free').toLowerCase();
        let data = { isActive: userType !== 'free', plan: userType, expiresAt: null };

        if (userType === 'premium') {
            const premium = await PremiumUser.findOne({ where: { Username: username } });
            if (premium) {
                if (new Date(premium.subscriptionEnd) < new Date()) {
                    await user.update({ UserType: 'free' });
                    await premium.update({ isActive: false });
                    data.isActive = false; data.plan = 'free';
                } else { data.expiresAt = premium.subscriptionEnd; }
            }
        }
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.createSubscription = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body;
        let price = planId === 'premium_quarterly' ? 150 : 50;
        let duration = planId === 'premium_quarterly' ? 'quarterly' : 'monthly';

        const user = await UserLogin.findByPk(req.user.Username);
        const sub = await Subscription.create({ planName: 'premium', price, duration, status: 'active' });

        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + (duration === 'monthly' ? 1 : 3));

        await user.update({ UserType: 'premium' });
        let premium = await PremiumUser.findOne({ where: { Username: req.user.Username } });
        if (premium) await premium.update({ subscriptionId: sub.subscriptionId, subscriptionStart: start, subscriptionEnd: end, isActive: true, paymentStatus: 'paid' });
        else await PremiumUser.create({ Username: req.user.Username, subscriptionId: sub.subscriptionId, subscriptionStart: start, subscriptionEnd: end, isActive: true, paymentStatus: 'paid' });

        const token = jwt.sign({ id: user.Username, userType: 'premium' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        res.json({ success: true, data: { token, expiresAt: end } });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({ where: { Username: req.user.Username }, order: [['date', 'DESC']] });
        res.json({ success: true, data: invoices });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

/**
 * ==========================================
 * PAYMENTS (STRIPE)
 * ==========================================
 */

exports.createPaymentIntent = async (req, res) => {
    try {
        const { planId } = req.body;
        const amount = planId === 'premium_quarterly' ? 15000 : 5000;
        const intent = await stripe.paymentIntents.create({
            amount, currency: 'usd', metadata: { userId: req.user.Username, planId },
            automatic_payment_methods: { enabled: true }
        });
        res.json({ success: true, clientSecret: intent.client_secret, amount });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

/**
 * ==========================================
 * EXPORT & FEEDBACK
 * ==========================================
 */

exports.submitFeedback = async (req, res) => {
    try {
        const { type, message, rating } = req.body;
        const feedback = await Feedback.create({
            Username: req.user?.Username, email: req.user?.Email || req.body.email,
            type: type || 'general', message, rating, status: 'new'
        });
        res.status(201).json({ success: true, data: feedback });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getExportUsage = async (req, res) => {
    try {
        // Mocked or from DB logic
        res.json({ success: true, data: { used: 0, limit: req.user.UserType === 'premium' ? 1000 : 0 } });
    } catch (err) { res.status(500).json({ success: false, error: 'Failed' }); }
};

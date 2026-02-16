const { Subscription, UserLogin, PremiumUser, Invoice, PaymentMethod } = require('../models');
const { Op } = require('sequelize');

// Get billing overview for current user
exports.getBillingOverview = async (req, res) => {
    try {
        const userType = (req.user.UserType || 'free').toLowerCase();
        const username = req.user.Username;

        let planDetails = {
            currentPlan: 'Free',
            price: 0,
            billingCycle: 'monthly',
            nextBilling: null,
            totalThisMonth: 0,
            yearToDate: 0,
            outstanding: 0
        };

        if (userType === 'free') {
            return res.json({ success: true, data: planDetails });
        }

        let userSubscription = null;

        if (userType === 'premium') {
            userSubscription = await PremiumUser.findOne({
                where: { Username: username },
                include: [{ model: Subscription }]
            });
        }

        if (userSubscription && userSubscription.Subscription) {
            const sub = userSubscription.Subscription;
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Calculate totals from Invoices table
            const yearToDateTotal = await Invoice.sum('amount', {
                where: {
                    Username: username,
                    status: 'paid',
                    date: { [Op.gte]: startOfYear }
                }
            }) || 0;

            const monthTotal = await Invoice.sum('amount', {
                where: {
                    Username: username,
                    status: 'paid',
                    date: { [Op.gte]: startOfMonth }
                }
            }) || 0;

            const outstanding = await Invoice.sum('amount', {
                where: {
                    Username: username,
                    status: { [Op.in]: ['pending', 'failed'] }
                }
            }) || 0;

            planDetails = {
                currentPlan: sub.planName.charAt(0).toUpperCase() + sub.planName.slice(1),
                price: parseFloat(sub.price),
                billingCycle: sub.duration,
                nextBilling: userSubscription.subscriptionEnd,
                totalThisMonth: monthTotal,
                yearToDate: yearToDateTotal,
                outstanding: outstanding
            };
        }

        res.json({
            success: true,
            data: planDetails
        });
    } catch (error) {
        console.error('Get billing overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch billing overview'
        });
    }
};

// Get invoice history
exports.getInvoices = async (req, res) => {
    try {
        const username = req.user.Username; // This is the Username (email)

        const invoices = await Invoice.findAll({
            where: { Username: username },
            order: [['date', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoices'
        });
    }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
    try {
        const username = req.user.Username; // This is the Username (email)

        const methods = await PaymentMethod.findAll({
            where: { Username: username },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: methods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment methods'
        });
    }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
    try {
        const username = req.user.Username;
        const { type, last4, brand, expiryMonth, expiryYear } = req.body;

        const newMethod = await PaymentMethod.create({
            id: 'pm_' + Date.now(),
            Username: username,
            type,
            last4,
            brand,
            expiryMonth,
            expiryYear,
            isDefault: false // Default to false, logic to make default can be added
        });

        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            data: newMethod
        });
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add payment method'
        });
    }
};

// Update billing address (updates UserLogin/Profile)
exports.updateBillingAddress = async (req, res) => {
    try {
        const username = req.user.Username;
        const { address, city, state, pin } = req.body;

        const user = await UserLogin.findByPk(username);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update({
            Address: address || user.Address,
            City: city || user.City,
            State: state || user.State,
            Pin: pin || user.Pin
        });

        res.json({
            success: true,
            message: 'Billing address updated successfully'
        });
    } catch (error) {
        console.error('Update billing address error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update billing address'
        });
    }
};

// Get all invoices (Admin only)
exports.getAllInvoices = async (req, res) => {
    try {
        if (req.user.UserType !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const invoices = await Invoice.findAll({
            order: [['date', 'DESC']],
            limit: 100,
            include: [{
                model: UserLogin,
                attributes: ['FirstName', 'LastName', 'Email']
            }]
        });

        res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error('Get all invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch all invoices'
        });
    }
};// Get subscription status (simplified for frontend)
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userType = (req.user.UserType || 'free').toLowerCase();
        const username = req.user.Username;

        let data = {
            isActive: userType !== 'free',
            plan: userType,
            type: userType,
            expiresAt: null
        };

        if (userType === 'premium') {
            const sub = await PremiumUser.findOne({ where: { Username: username } });
            if (sub) data.expiresAt = sub.subscriptionEnd;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

module.exports = exports;

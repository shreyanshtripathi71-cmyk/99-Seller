const { UserLogin, Property, Subscription, Auction, CrawlerRun, Errors, Poppin, AdminActivity, MotiveTypes, PremiumUser, SiteContent, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const activityService = require('../services/activityService');

/**
 * Get Dashboard Stats
 * @route GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
    try {

        // 1. User Stats
        const totalUsers = await UserLogin.count().catch(() => 0);

        const userTypesRaw = await UserLogin.findAll({
            attributes: ['UserType', [sequelize.fn('count', sequelize.col('Username')), 'count']],
            group: ['UserType']
        }).catch(() => []);

        const userTypes = {};
        userTypesRaw.forEach(item => {
            userTypes[item.getDataValue('UserType') || 'unknown'] = parseInt(item.getDataValue('count'));
        });

        const adminUsers = userTypes['admin'] || 0;
        const regularUsers = totalUsers - adminUsers;

        // 2. Property Stats - Group by Motive Types
        const totalProperties = await Property.count().catch(() => 0);

        const propertiesByType = await Property.findAll({
            attributes: [
                [sequelize.col('motiveType.name'), 'PType'],
                [sequelize.fn('count', sequelize.col('Property.id')), 'count'],
                [sequelize.fn('avg', sequelize.cast(sequelize.col('PTotAppraisedAmt'), 'DECIMAL')), 'avgPrice']
            ],
            include: [{
                model: MotiveTypes,
                as: 'motiveType',
                attributes: []
            }],
            group: [sequelize.col('motiveType.name'), 'motiveType.id'],
            raw: true
        }).catch((err) => {
            console.error('Property distribution error:', err);
            return [];
        });

        const totalValueRes = await Property.findAll({
            attributes: [[sequelize.fn('sum', sequelize.cast(sequelize.col('PTotAppraisedAmt'), 'DECIMAL')), 'totalValue']],
            raw: true
        }).catch(() => [{ totalValue: 0 }]);
        const totalValue = parseFloat(totalValueRes[0]?.totalValue || 0);
        const avgPrice = totalProperties > 0 ? totalValue / totalProperties : 0;

        // 3. Subscription & Revenue Stats (Linked to Users Only)
        // Premium Stats
        const premiumSubs = await PremiumUser.findAll({
            include: [{
                model: Subscription,
                attributes: ['price', 'status']
            }],
            raw: true
        }).catch(() => []);

        const premiumRevenue = premiumSubs.filter(s => s['Subscription.status'] === 'active')
            .reduce((acc, curr) => acc + parseFloat(curr['Subscription.price'] || 0), 0);
        const activePremium = premiumSubs.filter(s => s['Subscription.status'] === 'active').length;
        const expiredPremium = premiumSubs.filter(s => s['Subscription.status'] === 'expired').length;

        const monthlyRevenue = premiumRevenue;
        const yearlyRevenue = monthlyRevenue * 12;
        const activeSubscriptions = activePremium;
        const expiredSubscriptions = expiredPremium;
        const totalSubs = premiumSubs.length;
        const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;

        const planDistribution = {
            premium: premiumSubs.filter(s => s['Subscription.status'] === 'active').length,
            free: userTypes['free'] || 0
        };

        const revenueDistribution = {
            premium: premiumRevenue,
            free: 0
        };

        // 4. Auction Stats
        const totalAuctions = await Auction.count().catch(() => 0);
        const upcomingAuctions = await Auction.count({
            where: {
                AAuctionDateTime: {
                    [Op.gte]: new Date(),
                    [Op.lte]: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        }).catch(() => 0);

        // 5. Growth Trends (Current Month vs Last Month)
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);
        const lastMonthEnd = new Date();
        lastMonthEnd.setDate(0);

        const currentMonthUsers = await UserLogin.count({ where: { createdAt: { [Op.gte]: new Date(new Date().setDate(1)) } } }).catch(() => 0);
        const lastMonthUsers = await UserLogin.count({ where: { createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] } } }).catch(() => 0);
        const userGrowth = lastMonthUsers > 0 ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

        res.json({
            success: true,
            data: {
                users: {
                    totalUsers,
                    adminUsers,
                    regularUsers,
                    userTypes,
                    growth: userGrowth.toFixed(1)
                },
                properties: {
                    totalProperties,
                    totalValue,
                    avgPrice,
                    propertiesByType,
                    growth: 0 // Placeholder for now
                },
                subscriptions: {
                    totalSubscriptions: totalSubs,
                    activeSubscriptions,
                    expiredSubscriptions,
                    cancelledSubscriptions: 0,
                    trialingSubscriptions: 0,
                    monthlyRevenue,
                    yearlyRevenue,
                    conversionRate,
                    planDistribution,
                    revenueDistribution,
                    growth: 0 // Placeholder for now
                },
                auctions: {
                    total: totalAuctions,
                    upcoming: upcomingAuctions
                }
            }
        });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Historical Chart Data
 * @route GET /api/admin/historical-stats
 */
exports.getHistoricalStats = async (req, res) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const labels = [];
        const revenueData = [];
        const userGrowthData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            labels.push(months[monthIndex]);

            // Define month boundaries
            const startOfMonth = new Date(year, monthIndex, 1);
            const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

            // Calculate revenue for that month (using createdAt as a proxy for historical subscription state)
            const premiumMonth = await PremiumUser.findAll({
                where: { createdAt: { [Op.lte]: endOfMonth } },
                include: [{ model: Subscription, where: { status: 'active' } }]
            }).catch(() => []);

            const rev = premiumMonth.reduce((acc, curr) => acc + parseFloat(curr.Subscription?.price || 0), 0);

            revenueData.push(rev);

            // New Users in that month
            const newUsers = await UserLogin.count({
                where: { createdAt: { [Op.between]: [startOfMonth, endOfMonth] } }
            }).catch(() => 0);
            userGrowthData.push(newUsers);
        }

        res.json({
            success: true,
            data: {
                labels,
                datasets: [
                    { label: 'Revenue ($)', data: revenueData },
                    { label: 'New Users', data: userGrowthData }
                ]
            }
        });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Subscription Plan Management
 */
exports.getPlans = async (req, res) => {
    try {
        const plans = await Subscription.findAll({
            where: { planName: ['premium', 'free'] },
            order: [['price', 'ASC']]
        });
        res.json({ success: true, data: plans });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createOrUpdatePlan = async (req, res) => {
    try {
        const { subscriptionId, planName, price, duration, status, description, features, popular } = req.body;

        let plan;
        if (subscriptionId) {
            plan = await Subscription.findByPk(subscriptionId);
            if (plan) {
                await plan.update({ planName, price, duration, status, description, features, popular });
            }
        }

        if (!plan) {
            plan = await Subscription.create({ planName, price, duration, status, description, features, popular });
        }

        res.json({ success: true, data: plan });
    } catch (err) {
        console.error('CreateOrUpdatePlan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const plan = await Subscription.findByPk(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        await plan.destroy();
        res.json({ success: true, message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const username = req.params.id; // From route /subscriptions/:id/cancel

        let user = await PremiumUser.findByPk(username);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Subscriber not found' });
        }

        user.paymentStatus = 'cancelled';
        await user.save();

        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (err) {
        console.error('CancelSubscription Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get All Users
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserLogin.findAll({
            attributes: { exclude: ['Password'] },
            order: [['Username', 'ASC']]
        });
        res.json({ success: true, data: users });
    } catch (err) {
        console.error('GetAllUsers Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Create User (Manual)
 * @route POST /api/admin/users
 */
exports.createUser = async (req, res) => {
    try {
        const { FirstName, LastName, Email, Contact, UserType, Password } = req.body;

        if (!Email || !Password) {
            return res.status(400).json({ success: false, error: "Email and Password are required" });
        }

        const existingUser = await UserLogin.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const newUser = await UserLogin.create({
            Username: Email,
            FirstName,
            LastName,
            Email,
            Contact,
            UserType: UserType || 'free',
            Password: hashedPassword
        });

        await activityService.logActivity('user', `Admin created user: ${Email}`);

        res.status(201).json({ success: true, data: { Email: newUser.Email, UserType: newUser.UserType } });
    } catch (err) {
        console.error('CreateUser Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Update User
 * @route PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Using Email/Username as id based on model
        const { FirstName, LastName, Email, Contact, UserType, Password } = req.body;

        const user = await UserLogin.findOne({ where: { Username: id } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updateData = { FirstName, LastName, Email, Contact, UserType };
        if (Password) {
            updateData.Password = await bcrypt.hash(Password, 10);
        }

        await user.update(updateData);
        await activityService.logActivity('user', `Admin updated user: ${id}`);

        res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        console.error('UpdateUser Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Delete User
 * @route DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserLogin.findOne({ where: { Username: id } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await user.destroy();
        await activityService.logActivity('user', `Admin deleted user: ${id}`);

        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error('DeleteUser Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Bulk Upload Users (CSV)
 * @route POST /api/admin/users/upload
 */
exports.uploadUsersCSV = async (req, res) => {
    try {
        const { users } = req.body; // Expecting array of user objects from frontend CSV parser

        if (!users || !Array.isArray(users)) {
            return res.status(400).json({ success: false, error: "Invalid users data" });
        }

        let createdCount = 0;
        let errors = [];

        for (const userData of users) {
            try {
                const { Username, Email, FirstName, LastName, Password, UserType, Contact } = userData;
                const finalEmail = Email || Username;

                if (!finalEmail) {
                    errors.push(`Row missing email: ${JSON.stringify(userData)}`);
                    continue;
                }

                const existing = await UserLogin.findOne({ where: { Username: finalEmail } });
                if (existing) {
                    errors.push(`User ${finalEmail} already exists`);
                    continue;
                }

                const hashedPassword = await bcrypt.hash(Password || 'tempPassword123!', 10);

                await UserLogin.create({
                    Username: finalEmail,
                    Email: finalEmail,
                    FirstName,
                    LastName,
                    Contact,
                    UserType: (UserType || 'free').toLowerCase(),
                    Password: hashedPassword
                });
                createdCount++;
            } catch (innerErr) {
                errors.push(`Error creating user ${userData.Email || 'unknown'}: ${innerErr.message}`);
            }
        }

        await activityService.logActivity('user', `Admin bulk uploaded ${createdCount} users`);

        res.json({
            success: true,
            message: `Successfully uploaded ${createdCount} users`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error('BulkUpload Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get All Subscriptions
 * @route GET /api/admin/subscriptions
 */
exports.getAllSubscriptions = async (req, res) => {
    try {
        const premium = await PremiumUser.findAll({
            include: [{ model: Subscription, attributes: ['planName', 'price', 'duration'] }]
        });
        const allSubscribers = [
            ...premium.map(p => ({
                Username: p.Username,
                planName: p.Subscription?.planName || 'Premium',
                status: p.paymentStatus === 'paid' ? 'active' : 'pending',
                price: p.Subscription?.price || 0,
                duration: p.Subscription?.duration || 'monthly',
                subscriptionStart: p.subscriptionStart,
                subscriptionEnd: p.subscriptionEnd,
                paymentStatus: p.paymentStatus
            }))
        ];

        res.json({ success: true, data: allSubscribers });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get All Properties
 * @route GET /api/admin/properties
 */
exports.getAllProperties = async (req, res) => {
    try {
        const { Proaddress, Owner, MotiveTypes, Loan, Auction, Violation, Probate, Eviction, Divorce, TaxLien } = require('../models');
        const properties = await Property.findAll({
            include: [
                {
                    model: Proaddress,
                    as: 'proaddress',
                    attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip', 'beds', 'baths', 'price', 'proptype', 'square_feet', 'owner_current_state']
                },
                {
                    model: Owner,
                    as: 'owners',
                    attributes: ['OFirstName', 'OLastName']
                },
                { model: MotiveTypes, as: 'motiveType' },
                { model: Loan, as: 'loans', limit: 1 },
                { model: Auction, as: 'auctions', limit: 1 },
                { model: Violation, as: 'violations', limit: 1 },
                { model: Probate, as: 'probates', limit: 1 },
                { model: Eviction, as: 'evictions', limit: 1 },
                { model: Divorce, as: 'divorces', limit: 1 },
                { model: TaxLien, as: 'taxLiens', limit: 1 }
            ],
            order: [['id', 'DESC']],
            limit: 100
        });
        res.json({ success: true, data: properties });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Single Property Details
 * @route GET /api/admin/properties/:id
 */
exports.getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { Proaddress, Owner, Loan, Auction, Eviction, Violation, MotiveTypes, Auctioneer, Probate, Divorce, TaxLien } = require('../models');

        const property = await Property.findByPk(id, {
            include: [
                { model: Proaddress, as: 'proaddress' },
                { model: Owner, as: 'owners' },
                { model: Loan, as: 'loans' },
                { model: Auction, as: 'auctions' },
                { model: Eviction, as: 'evictions' },
                { model: Violation, as: 'violations' },
                { model: Probate, as: 'probates' },
                { model: Divorce, as: 'divorces' },
                { model: TaxLien, as: 'taxLiens' },
                { model: MotiveTypes, as: 'motiveType' },
                { model: Auctioneer, as: 'auctioneer' }
            ]
        });

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        res.json({ success: true, data: property });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Update Property
 * @route PUT /api/admin/properties/:id
 */
exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Proaddress: ProaddressModel,
            Owner,
            Loan,
            Auction,
            Eviction,
            Violation,
            Probate,
            Divorce,
            TaxLien,
            Auctioneer
        } = require('../models');

        const property = await Property.findByPk(id, {
            include: [{ model: ProaddressModel, as: 'proaddress' }]
        });

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        // 1. Update Property fields
        await property.update(req.body);

        // 2. Update Proaddress (and embedded Trustee info)
        if (req.body.proaddress || req.body.trustee) {
            let proaddressData = req.body.proaddress || {};

            // Map Trustee fields if present
            if (req.body.trustee) {
                const t = req.body.trustee;
                if (t.TTrusteeName) proaddressData.trusteename = t.TTrusteeName;
                if (t.TTrusteePhone) proaddressData.trusteephone = t.TTrusteePhone;
                if (t.TTrusteeAddress) proaddressData.trusteeaddress = t.TTrusteeAddress;
                if (t.TTrusteeEmail) proaddressData.trusteeemail = t.TTrusteeEmail;
            }

            if (property.proaddress) {
                await property.proaddress.update(proaddressData);
            } else {
                // Create if not exists (should rarely happen for existing properties)
                const newPa = await ProaddressModel.create(proaddressData);
                await property.setProaddress(newPa);
            }
        }

        // 3. Update Owners
        if (req.body.owners && Array.isArray(req.body.owners)) {
            // Simplest strategy: delete existing and create new
            await Owner.destroy({ where: { property_id: id } });

            const ownersToCreate = req.body.owners.map(o => ({
                ...o,
                property_id: id
            }));
            if (ownersToCreate.length > 0) {
                await Owner.bulkCreate(ownersToCreate);
            }
        }

        // 4. Update Motive Specific Associations (Arrays)

        // Auctions
        if (req.body.auctions && Array.isArray(req.body.auctions)) {
            await Auction.destroy({ where: { APropertyID: id } });
            const records = req.body.auctions.map(a => ({
                ...a,
                APropertyID: id
            }));
            if (records.length > 0) await Auction.bulkCreate(records);
        }

        // Loans
        if (req.body.loans && Array.isArray(req.body.loans)) {
            await Loan.destroy({ where: { property_id: id } });
            const records = req.body.loans.map(l => ({
                ...l,
                property_id: id
            }));
            if (records.length > 0) await Loan.bulkCreate(records);
        }

        // Probates
        if (req.body.probates && Array.isArray(req.body.probates)) {
            await Probate.destroy({ where: { property_id: id } });
            const records = req.body.probates.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Probate.bulkCreate(records);
        }

        // Violations
        if (req.body.violations && Array.isArray(req.body.violations)) {
            await Violation.destroy({ where: { property_id: id } });
            const records = req.body.violations.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Violation.bulkCreate(records);
        }

        // Evictions
        if (req.body.evictions && Array.isArray(req.body.evictions)) {
            await Eviction.destroy({ where: { property_id: id } });
            const records = req.body.evictions.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Eviction.bulkCreate(records);
        }

        // Divorces
        if (req.body.divorces && Array.isArray(req.body.divorces)) {
            await Divorce.destroy({ where: { property_id: id } });
            const records = req.body.divorces.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Divorce.bulkCreate(records);
        }

        // TaxLiens
        if (req.body.taxLiens && Array.isArray(req.body.taxLiens)) {
            await TaxLien.destroy({ where: { property_id: id } });
            const records = req.body.taxLiens.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await TaxLien.bulkCreate(records);
        }

        // 5. Update Auctioneer
        if (req.body.auctioneer && property.auctioneer_id) {
            // Update existing auctioneer linked to this property
            // Note: If multiple properties share an auctioneer, this changes it for all. 
            // Assuming 1:1 for now based on typical seed behavior, or desired admin behavior.
            await Auctioneer.update(req.body.auctioneer, { where: { id: property.auctioneer_id } });
        } else if (req.body.auctioneer && !property.auctioneer_id) {
            // Create new auctioneer and link
            const newAuctioneer = await Auctioneer.create(req.body.auctioneer);
            await property.setAuctioneer(newAuctioneer);
        }

        // Log the change
        await activityService.logActivity('PROPERTY_UPDATE', `Property ${id} updated`, { propertyId: id });

        // Include validation warnings if they exist (middleware handling)
        const response = { success: true, data: property, warnings: req.validationWarnings };
        res.json(response);
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Create Property
 * @route POST /api/admin/properties
 */
exports.createProperty = async (req, res) => {
    try {
        const {
            Property,
            Proaddress: ProaddressModel,
            Owner,
            Loan,
            Auction,
            Eviction,
            Violation,
            Probate,
            Divorce,
            TaxLien,
            Auctioneer,
            MotiveTypes
        } = require('../models');

        // 1. Create Proaddress first
        const proaddressData = req.body.proaddress || {};
        if (req.body.trustee) {
            const t = req.body.trustee;
            if (t.TTrusteeName) proaddressData.trusteename = t.TTrusteeName;
            if (t.TTrusteePhone) proaddressData.trusteephone = t.TTrusteePhone;
            if (t.TTrusteeAddress) proaddressData.trusteeaddress = t.TTrusteeAddress;
            if (t.TTrusteeEmail) proaddressData.trusteeemail = t.TTrusteeEmail;
        }
        const proaddress = await ProaddressModel.create(proaddressData);

        // 2. Create Property
        const propertyData = {
            ...req.body,
            proaddress_id: proaddress.id
        };
        const property = await Property.create(propertyData);

        const id = property.id;

        // 3. Create Owners
        if (req.body.owners && Array.isArray(req.body.owners)) {
            const ownersToCreate = req.body.owners.map(o => ({
                ...o,
                property_id: id
            }));
            if (ownersToCreate.length > 0) {
                await Owner.bulkCreate(ownersToCreate);
            }
        }

        // 4. Motive Specific Associations
        if (req.body.auctions && Array.isArray(req.body.auctions)) {
            const records = req.body.auctions.map(a => ({ ...a, APropertyID: id }));
            if (records.length > 0) await Auction.bulkCreate(records);
        }

        if (req.body.loans && Array.isArray(req.body.loans)) {
            const records = req.body.loans.map(l => ({ ...l, property_id: id }));
            if (records.length > 0) await Loan.bulkCreate(records);
        }

        if (req.body.probates && Array.isArray(req.body.probates)) {
            const records = req.body.probates.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Probate.bulkCreate(records);
        }

        if (req.body.violations && Array.isArray(req.body.violations)) {
            const records = req.body.violations.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Violation.bulkCreate(records);
        }

        if (req.body.evictions && Array.isArray(req.body.evictions)) {
            const records = req.body.evictions.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Eviction.bulkCreate(records);
        }

        if (req.body.divorces && Array.isArray(req.body.divorces)) {
            const records = req.body.divorces.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await Divorce.bulkCreate(records);
        }

        if (req.body.taxLiens && Array.isArray(req.body.taxLiens)) {
            const records = req.body.taxLiens.map(r => ({ ...r, property_id: id }));
            if (records.length > 0) await TaxLien.bulkCreate(records);
        }

        // 5. Auctioneer
        if (req.body.auctioneer) {
            const newAuctioneer = await Auctioneer.create(req.body.auctioneer);
            await property.setAuctioneer(newAuctioneer);
        }

        // Log
        const { activityService } = require('../services/activityService');
        await activityService.logActivity('PROPERTY_CREATE', `Property ${id} created`, { propertyId: id });

        res.status(201).json({ success: true, data: property, warnings: req.validationWarnings });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Delete Property
 * @route DELETE /api/admin/properties/:id
 */
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id);

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        await property.destroy();

        // Log the deletion
        await activityService.logActivity('PROPERTY_DELETE', `Property ${id} deleted`, { propertyId: id });

        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Crawler Runs
 * @route GET /api/admin/crawler/runs
 */
exports.getCrawlerRuns = async (req, res) => {
    try {
        const runs = await CrawlerRun.findAll({
            order: [['LastRunStart', 'DESC']],
            limit: 50
        });
        res.json({ success: true, data: runs });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Crawler Errors
 * @route GET /api/admin/crawler/errors
 */
exports.getCrawlerErrors = async (req, res) => {
    try {
        const errors = await Errors.findAll({
            order: [['date_time', 'DESC']],
            limit: 50
        });
        res.json({ success: true, data: errors });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Poppins Management
 */
exports.getAllPoppins = async (req, res) => {
    try {
        const poppins = await Poppin.findAll({ order: [['priority', 'ASC']] });
        res.json({ success: true, data: poppins });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createPoppin = async (req, res) => {
    try {
        const poppin = await Poppin.create(req.body);
        res.status(201).json({ success: true, data: poppin });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

exports.updatePoppin = async (req, res) => {
    try {
        const poppin = await Poppin.findByPk(req.params.id);
        if (!poppin) return res.status(404).json({ success: false, message: 'Poppin not found' });

        await poppin.update(req.body);
        res.json({ success: true, data: poppin });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deletePoppin = async (req, res) => {
    try {
        const poppin = await Poppin.findByPk(req.params.id);
        if (!poppin) return res.status(404).json({ success: false, message: 'Poppin not found' });

        await poppin.destroy();
        res.json({ success: true, message: 'Poppin deleted' });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Recent Activity
 * @route GET /api/admin/activities
 */
exports.getRecentActivity = async (req, res) => {
    try {
        const activities = await AdminActivity.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.json({ success: true, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get Active Poppins (Public)
 * @route GET /api/poppins/active
 */
exports.getActivePoppins = async (req, res) => {
    try {
        const poppins = await Poppin.findAll({
            where: { isActive: true },
            order: [['priority', 'ASC']]
        });
        res.json({ success: true, data: poppins });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};



/**
 * Auction Management
 */
exports.getAllAuctions = async (req, res) => {
    try {
        const { Proaddress } = require('../models');
        const auctions = await Auction.findAll({
            include: [{
                model: Property,
                as: 'property',
                attributes: ['id', 'PStreetAddr1', 'Pcity', 'Pstate'],
                include: [{
                    model: Proaddress,
                    as: 'proaddress',
                    attributes: ['id', 'PStreetNum', 'PStreetName', 'Pcity', 'PState', 'price']
                }]
            }],
            order: [['AAuctionDateTime', 'DESC']],
            limit: 100
        });

        // Add status field based on auction date
        const auctionsWithStatus = auctions.map(auction => {
            const auctionData = auction.toJSON();
            const now = new Date();
            const auctionDate = new Date(auctionData.AAuctionDateTime);

            if (auctionDate > now) {
                const daysUntil = Math.ceil((auctionDate - now) / (1000 * 60 * 60 * 24));
                auctionData.status = daysUntil <= 7 ? 'upcoming' : 'upcoming';
            } else {
                auctionData.status = 'ended';
            }

            return auctionData;
        });

        res.json({ success: true, data: auctionsWithStatus });
    } catch (err) {
        console.error('getAllAuctions Error:', err);
        try {
            const fs = require('fs');
            fs.appendFileSync('backend_debug.log', `${new Date().toISOString()} - [DEBUG_ERROR] getAllAuctions: ${err.message}\n${err.stack}\n`);
        } catch (e) { }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await Auction.findByPk(id);

        if (!auction) {
            return res.status(404).json({ success: false, error: 'Auction not found' });
        }

        await auction.destroy();

        // Log the deletion
        await activityService.logActivity('AUCTION_DELETE', `Auction ${id} deleted`, { auctionId: id });

        res.json({ success: true, message: 'Auction deleted successfully' });
    } catch (err) {
        console.error('deleteAuction Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createAuction = async (req, res) => {
    try {
        const { APropertyID, AAuctionDateTime, AAuctionPlace, minimum_bid, AAuctionCity, AAuctionState, AAuctionDescription } = req.body;

        if (!APropertyID || !AAuctionDateTime || !minimum_bid) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const newAuction = await Auction.create({
            APropertyID,
            AAuctionDateTime,
            AAuctionPlace,
            minimum_bid,
            AAuctionCity,
            AAuctionState,
            AAuctionDescription,
            status: 'upcoming' // Default status, though usually derived from date
        });

        await activityService.logActivity('AUCTION_CREATE', `Auction created for Property ${APropertyID}`, { auctionId: newAuction.AAuctionID });

        res.status(201).json({ success: true, data: newAuction });
    } catch (err) {
        console.error('createAuction Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await Auction.findByPk(id);

        if (!auction) {
            return res.status(404).json({ success: false, error: 'Auction not found' });
        }

        await auction.update(req.body);

        await activityService.logActivity('AUCTION_UPDATE', `Auction ${id} updated`, { auctionId: id });

        res.json({ success: true, data: auction });
    } catch (err) {
        console.error('updateAuction Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};


/**
 * Site Content Management
 */
exports.getContent = async (req, res) => {
    try {
        const { key } = req.params;

        const content = await SiteContent.findOne({ where: { key } });
        if (!content) {
            return res.json({ success: true, data: { key, value: null } });
        }
        res.json({ success: true, data: content });
    } catch (err) {
        console.error('getContent Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, contentType } = req.body;

        let content = await SiteContent.findOne({ where: { key } });
        if (content) {
            await content.update({ value, contentType: contentType || content.contentType });
        } else {
            content = await SiteContent.create({ key, value, contentType: contentType || 'json' });
        }

        res.json({ success: true, data: content });
    } catch (err) {
        console.error('updateContent Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.listContent = async (req, res) => {
    try {
        const content = await SiteContent.findAll({
            attributes: ['key', 'contentType', 'updatedAt'],
            order: [['updatedAt', 'DESC']]
        });
        res.json({ success: true, data: content });
    } catch (err) {
        console.error('listContent Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const { key } = req.params;
        const content = await SiteContent.findOne({ where: { key } });
        if (!content) {
            return res.status(404).json({ success: false, error: 'Content not found' });
        }
        await content.destroy();
        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (err) {
        console.error('deleteContent Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Data Import from CSV
 * @route POST /api/admin/import
 */
exports.importData = async (req, res) => {
    try {
        const fs = require('fs');
        const csv = require('csv-parser');
        const results = [];
        const { Proaddress, Owner, Loan, Auction } = require('../models');

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                let stats = { totalRows: results.length, properties: 0, owners: 0, auctions: 0, loans: 0, errors: 0 };
                let errors = [];

                for (const row of results) {
                    try {
                        // Check for Property/Proaddress data
                        if (row.PStreetNum || row.PStreetName) {
                            const [proaddress] = await Proaddress.findOrCreate({
                                where: {
                                    PStreetNum: row.PStreetNum || '',
                                    PStreetName: row.PStreetName || '',
                                    Pcity: row.Pcity || ''
                                },
                                defaults: {
                                    PState: row.PState,
                                    Pzip: row.Pzip,
                                    beds: row.beds,
                                    baths: row.baths,
                                    price: row.price,
                                    proptype: row.proptype,
                                    square_feet: row.square_feet
                                }
                            });

                            const [property] = await Property.findOrCreate({
                                where: { proaddress_id: proaddress.id },
                                defaults: {
                                    PType: row.proptype,
                                    PTotSQFootage: row.square_feet
                                }
                            });
                            stats.properties++;

                            // Check for Owner data
                            if (row.OFirstName || row.OLastName) {
                                await Owner.create({
                                    OFirstName: row.OFirstName,
                                    OLastName: row.OLastName,
                                    OProperty_id: property.id
                                });
                                stats.owners++;
                            }
                        }
                    } catch (err) {
                        stats.errors++;
                        errors.push(`Row error: ${err.message}`);
                    }
                }

                // Clean up uploaded file
                fs.unlinkSync(filePath);

                await activityService.logActivity('IMPORT', `Bulk imported ${stats.totalRows} rows of data`);

                res.json({
                    success: true,
                    data: {
                        message: `Import completed: ${stats.properties} properties, ${stats.owners} owners.`,
                        stats,
                        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
                    }
                });
            });
    } catch (err) {
        console.error('Import Error:', err);
        res.status(500).json({ success: false, error: 'Server Error during import' });
    }
};

/**
 * Upload Property Image (Admin)
 * @route POST /api/admin/properties/:id/image
 */
exports.uploadPropertyImage = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        const property = await Property.findByPk(id);
        if (!property) {
            // Clean up uploaded file if property not found
            const fs = require('fs');
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        // Save filename to DB
        property.local_image_path = file.filename;
        await property.save();

        await activityService.logActivity('PROPERTY_UPDATE', `Admin uploaded image for Property ${id}`, { propertyId: id });

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imagePath: file.filename,
                fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
            }
        });
    } catch (err) {
        console.error('UploadPropertyImage Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};


/**
 * Get Import Template
 * @route GET /api/admin/import/template/:target
 */
exports.getImportTemplate = async (req, res) => {
    const { target } = req.params;
    let headers = '';

    switch (target) {
        case 'properties':
            headers = 'PStreetNum,PStreetName,Pcity,PState,Pzip,beds,baths,price,proptype,square_feet,motive_code,OFirstName,OLastName\n';
            break;
        case 'owners':
            headers = 'OFirstName,OLastName,OStreetAddr1,OCity,OState,OZip,PropertyID\n';
            break;
        case 'auctions':
            headers = 'PropertyID,AAuctionDateTime,AAuctionPlace,minimum_bid\n';
            break;
        case 'loans':
            headers = 'PropertyID,lender_name,loan_amount,loan_type,lis_pendens_date,arrears_amount\n';
            break;
        case 'violations':
            headers = 'PropertyID,types,fine_amount,remediation_deadline\n';
            break;
        case 'probates':
            headers = 'PropertyID,probate_court_county,date_of_death,executor_name\n';
            break;
        case 'evictions':
            headers = 'PropertyID,court_date,court_docket,plaintiff_name\n';
            break;
        case 'divorces':
            headers = 'PropertyID,case_number,legal_filing_date,attorney_name\n';
            break;
        case 'taxLiens':
            headers = 'PropertyID,amount_owed,last_tax_year_paid,status\n';
            break;
        default:
            return res.status(400).json({ success: false, error: 'Invalid template target' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=template_${target}.csv`);
    res.status(200).send(headers);
};

/**
 * Get All Owners
 * @route GET /api/admin/owners
 */
exports.getAllOwners = async (req, res) => {
    try {
        const { Owner, Property, Proaddress } = require('../models');
        const owners = await Owner.findAll({
            include: [
                {
                    model: Property,
                    as: 'property',
                    include: [{ model: Proaddress, as: 'proaddress' }]
                }
            ],
            limit: 1000,
            order: [['id', 'DESC']]
        });

        const formattedOwners = owners.map(o => ({
            id: o.id,
            first_name: o.OFirstName,
            last_name: o.OLastName,
            email: o.OEmailAddr,
            phone: o.OPhone,
            mailing_address: o.OStreetAddr1,
            city: o.OCity,
            state: o.OState,
            zip: o.OZip,
            property_count: 1, // Simplified for now since Owner belongsTo Property in this schema
            property_id: o.OProperty_id
        }));

        res.json({ success: true, owners: formattedOwners });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Owner Stats
 */
exports.getOwnerStats = async (req, res) => {
    try {
        const { Owner } = require('../models');
        const total = await Owner.count();
        const withEmail = await Owner.count({ where: { OEmailAddr: { [Op.ne]: null } } });
        const withPhone = await Owner.count({ where: { OPhone: { [Op.ne]: null } } });

        res.json({ success: true, total, withEmail, withPhone });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get All Loans
 * @route GET /api/admin/loans
 */
exports.getAllLoans = async (req, res) => {
    try {
        const { Loan, Property, Proaddress } = require('../models');
        const loansList = await Loan.findAll({
            include: [
                {
                    model: Property,
                    as: 'property',
                    include: [{ model: Proaddress, as: 'proaddress' }]
                }
            ],
            limit: 1000
        });

        const formattedLoans = loansList.map(l => ({
            id: l.id,
            lender_name: l.lender_name || l.BankName,
            loan_amount: l.loan_amount || l.LoanAmount,
            loan_type: l.loan_type || l.LoanType,
            interest_rate: l.interest_rate,
            maturity_date: l.maturity_date,
            status: l.status || (l.foreclosure_stage ? 'Foreclosure' : 'Active'),
            property_id: l.property_id,
            property_address: l.property?.proaddress ? `${l.property.proaddress.PStreetNum} ${l.property.proaddress.PStreetName}` : 'N/A'
        }));

        res.json({ success: true, loans: formattedLoans });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Loan Stats
 */
exports.getLoanStats = async (req, res) => {
    try {
        const { Loan } = require('../models');
        const total = await Loan.count();
        const totalValue = await Loan.sum('loan_amount') || 0;
        const avgAmount = total > 0 ? totalValue / total : 0;

        res.json({ success: true, total, totalValue, avgAmount });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.uploadContentImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Return the relative URL to the file
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, data: { url: fileUrl } });
    } catch (err) {
        console.error('uploadContentImage Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Motive Type Requirements
 * @route GET /api/admin/motive-types/requirements
 */
exports.getMotiveTypeRequirements = async (req, res) => {
    try {
        const { getAllMotiveTypeRules } = require('../middleware/motiveTypeValidator');
        const rules = getAllMotiveTypeRules();
        res.json({ success: true, data: rules });
    } catch (err) {
        console.error('getMotiveTypeRequirements Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get Single Motive Type Requirements
 * @route GET /api/admin/motive-types/requirements/:code
 */
exports.getMotiveTypeRequirement = async (req, res) => {
    try {
        const { code } = req.params;
        const { getMotiveTypeRequirements } = require('../middleware/motiveTypeValidator');
        const requirements = getMotiveTypeRequirements(code);

        if (!requirements) {
            return res.status(404).json({ success: false, error: 'Motive type not found' });
        }

        res.json({ success: true, data: requirements });
    } catch (err) {
        console.error('getMotiveTypeRequirement Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
/**
 * Get All Motive Types
 */
exports.getMotiveTypes = async (req, res) => {
    try {
        const { MotiveTypes } = require('../models');
        const types = await MotiveTypes.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: types });
    } catch (err) {
        console.error('getMotiveTypes Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
/**
 * Delete Property Image
 * @route DELETE /api/admin/properties/:id/image
 */
exports.deletePropertyImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { Property } = require('../models');
        const fs = require('fs');
        const path = require('path');

        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        if (property.local_image_path) {
            const absolutePath = path.join(__dirname, '..', '..', 'backend', property.local_image_path);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        property.local_image_path = null;
        await property.save();

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (err) {
        console.error('deletePropertyImage Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
/**
 * Owner Management
 */
exports.getAllOwners = async (req, res) => {
    try {
        const { Owner, Property, Proaddress } = require('../models');
        const owners = await Owner.findAll({
            include: [{
                model: Property,
                as: 'property',
                include: [{
                    model: Proaddress,
                    as: 'proaddress',
                    attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip']
                }]
            }],
            order: [['id', 'DESC']]
        });
        res.json({ success: true, data: owners });
    } catch (err) {
        console.error('GetAllOwners Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getOwnerDetails = async (req, res) => {
    try {
        const { Owner, Property, Proaddress } = require('../models');
        const owner = await Owner.findByPk(req.params.id, {
            include: [{
                model: Property,
                as: 'property',
                include: [{
                    model: Proaddress,
                    as: 'proaddress'
                }]
            }]
        });

        if (!owner) {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }

        res.json({ success: true, data: owner });
    } catch (err) {
        console.error('GetOwnerDetails Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createOwner = async (req, res) => {
    try {
        const { Owner } = require('../models');
        const owner = await Owner.create(req.body);
        await activityService.logActivity('OWNER_CREATE', `Owner ${owner.id} created`);
        res.status(201).json({ success: true, data: owner });
    } catch (err) {
        console.error('CreateOwner Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateOwner = async (req, res) => {
    try {
        const { Owner } = require('../models');
        const owner = await Owner.findByPk(req.params.id);

        if (!owner) {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }

        await owner.update(req.body);
        await activityService.logActivity('OWNER_UPDATE', `Owner ${owner.id} updated`);
        res.json({ success: true, data: owner });
    } catch (err) {
        console.error('UpdateOwner Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteOwner = async (req, res) => {
    try {
        const { Owner } = require('../models');
        const owner = await Owner.findByPk(req.params.id);

        if (!owner) {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }

        await owner.destroy();
        await activityService.logActivity('OWNER_DELETE', `Owner ${req.params.id} deleted`);
        res.json({ success: true, message: 'Owner deleted successfully' });
    } catch (err) {
        console.error('DeleteOwner Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getOwnerStats = async (req, res) => {
    try {
        const { Owner } = require('../models');
        const totalOwners = await Owner.count();
        const outOfStateOwners = await Owner.count({ where: { is_out_of_state: true } });

        res.json({
            success: true,
            data: {
                totalOwners,
                outOfStateOwners,
                inStateOwners: totalOwners - outOfStateOwners
            }
        });
    } catch (err) {
        console.error('GetOwnerStats Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Loan Management
 */
exports.getAllLoans = async (req, res) => {
    try {
        const { Loan, Property, Proaddress } = require('../models');
        const loans = await Loan.findAll({
            include: [{
                model: Property,
                as: 'property',
                include: [{
                    model: Proaddress,
                    as: 'proaddress',
                    attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip']
                }]
            }],
            order: [['id', 'DESC']]
        });
        res.json({ success: true, data: loans });
    } catch (err) {
        console.error('GetAllLoans Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getLoanDetails = async (req, res) => {
    try {
        const { Loan, Property, Proaddress } = require('../models');
        const loan = await Loan.findByPk(req.params.id, {
            include: [{
                model: Property,
                as: 'property',
                include: [{
                    model: Proaddress,
                    as: 'proaddress'
                }]
            }]
        });

        if (!loan) {
            return res.status(404).json({ success: false, error: 'Loan not found' });
        }

        res.json({ success: true, data: loan });
    } catch (err) {
        console.error('GetLoanDetails Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createLoan = async (req, res) => {
    try {
        const { Loan } = require('../models');
        const loan = await Loan.create(req.body);
        await activityService.logActivity('LOAN_CREATE', `Loan ${loan.id} created`);
        res.status(201).json({ success: true, data: loan });
    } catch (err) {
        console.error('CreateLoan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateLoan = async (req, res) => {
    try {
        const { Loan } = require('../models');
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ success: false, error: 'Loan not found' });
        }

        await loan.update(req.body);
        await activityService.logActivity('LOAN_UPDATE', `Loan ${loan.id} updated`);
        res.json({ success: true, data: loan });
    } catch (err) {
        console.error('UpdateLoan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteLoan = async (req, res) => {
    try {
        const { Loan } = require('../models');
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ success: false, error: 'Loan not found' });
        }

        await loan.destroy();
        await activityService.logActivity('LOAN_DELETE', `Loan ${req.params.id} deleted`);
        res.json({ success: true, message: 'Loan deleted successfully' });
    } catch (err) {
        console.error('DeleteLoan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getLoanStats = async (req, res) => {
    try {
        const { Loan } = require('../models');
        const totalLoans = await Loan.count();
        const totalLoanAmount = await Loan.sum('loan_amount') || 0;
        const totalArrears = await Loan.sum('arrears_amount') || 0;
        const inDefault = await Loan.count({ where: { default_status: 'In Default' } });

        res.json({
            success: true,
            data: {
                totalLoans,
                totalLoanAmount,
                totalArrears,
                inDefault,
                avgLoanAmount: totalLoans > 0 ? totalLoanAmount / totalLoans : 0
            }
        });
    } catch (err) {
        console.error('GetLoanStats Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

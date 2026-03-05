const {
    UserLogin, Property, Subscription, Auction, CrawlerRun, Errors,
    Poppin, AdminActivity, MotiveTypes, PremiumUser, SiteContent,
    sequelize, Feedback, Invoice, Proaddress, Owner, Loan,
    Auctioneer, Violation, Probate, Eviction, Divorce, TaxLien
} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../services/AppServices_Module');
const activityService = { logActivity };

/**
 * ==========================================
 * ADMIN DASHBOARD & STATS
 * ==========================================
 */

exports.getStats = async (req, res) => {
    try {
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

        const totalAuctions = await Auction.count().catch(() => 0);
        const upcomingAuctions = await Auction.count({
            where: {
                AAuctionDateTime: {
                    [Op.gte]: new Date(),
                    [Op.lte]: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        }).catch(() => 0);

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
                users: { totalUsers, adminUsers, regularUsers, userTypes, growth: userGrowth.toFixed(1) },
                properties: { totalProperties, totalValue, avgPrice, propertiesByType, growth: 0 },
                subscriptions: { totalSubscriptions: totalSubs, activeSubscriptions, expiredSubscriptions, cancelledSubscriptions: 0, trialingSubscriptions: 0, monthlyRevenue, yearlyRevenue, conversionRate, planDistribution, revenueDistribution, growth: 0 },
                auctions: { total: totalAuctions, upcoming: upcomingAuctions }
            }
        });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getHistoricalStats = async (req, res) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = [];
        const revenueData = [];
        const userGrowthData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            labels.push(months[monthIndex]);
            const startOfMonth = new Date(year, monthIndex, 1);
            const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

            const premiumMonth = await PremiumUser.findAll({
                where: { createdAt: { [Op.lte]: endOfMonth } },
                include: [{ model: Subscription, where: { status: 'active' } }]
            }).catch(() => []);

            const rev = premiumMonth.reduce((acc, curr) => acc + parseFloat(curr.Subscription?.price || 0), 0);
            revenueData.push(rev);

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
 * ==========================================
 * USER MANAGEMENT (ADMIN)
 * ==========================================
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

exports.createUser = async (req, res) => {
    try {
        const { FirstName, LastName, Email, Contact, UserType, Password } = req.body;
        if (!Email || !Password) return res.status(400).json({ success: false, error: "Email and Password are required" });

        const existingUser = await UserLogin.findOne({ where: { Email } });
        if (existingUser) return res.status(400).json({ success: false, error: "User already exists with this email" });

        const hashedPassword = await bcrypt.hash(Password, 10);
        const newUser = await UserLogin.create({
            Username: Email, FirstName, LastName, Email, Contact,
            UserType: UserType || 'free', Password: hashedPassword
        });

        await activityService.logActivity('user', `Admin created user: ${Email}`);
        res.status(201).json({ success: true, data: { Email: newUser.Email, UserType: newUser.UserType } });
    } catch (err) {
        console.error('CreateUser Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { FirstName, LastName, Email, Contact, UserType, Password } = req.body;

        const user = await UserLogin.findOne({ where: { Username: id } });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const updateData = { FirstName, LastName, Email, Contact, UserType };
        if (Password) updateData.Password = await bcrypt.hash(Password, 10);

        await user.update(updateData);
        await activityService.logActivity('user', `Admin updated user: ${id}`);
        res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        console.error('UpdateUser Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserLogin.findOne({ where: { Username: id } });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        await user.destroy();
        await activityService.logActivity('user', `Admin deleted user: ${id}`);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error('DeleteUser Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.uploadUsersCSV = async (req, res) => {
    try {
        const { users } = req.body;
        if (!users || !Array.isArray(users)) return res.status(400).json({ success: false, error: "Invalid users data" });

        let createdCount = 0;
        let errors = [];

        for (const userData of users) {
            try {
                const { Username, Email, FirstName, LastName, Password, UserType, Contact } = userData;
                const finalEmail = Email || Username;
                if (!finalEmail) { errors.push(`Row missing email: ${JSON.stringify(userData)}`); continue; }

                const existing = await UserLogin.findOne({ where: { Username: finalEmail } });
                if (existing) { errors.push(`User ${finalEmail} already exists`); continue; }

                const hashedPassword = await bcrypt.hash(Password || 'tempPassword123!', 10);
                await UserLogin.create({
                    Username: finalEmail, Email: finalEmail, FirstName, LastName, Contact,
                    UserType: (UserType || 'free').toLowerCase(), Password: hashedPassword
                });
                createdCount++;
            } catch (innerErr) {
                errors.push(`Error creating user ${userData.Email || 'unknown'}: ${innerErr.message}`);
            }
        }

        await activityService.logActivity('user', `Admin bulk uploaded ${createdCount} users`);
        res.json({ success: true, message: `Successfully uploaded ${createdCount} users`, errors: errors.length > 0 ? errors : undefined });
    } catch (err) {
        console.error('BulkUpload Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * ==========================================
 * PROPERTY MANAGEMENT (ADMIN)
 * ==========================================
 */

exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.findAll({
            include: [
                {
                    model: Proaddress, as: 'proaddress',
                    attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip', 'beds', 'baths', 'price', 'proptype', 'square_feet', 'owner_current_state']
                },
                { model: Owner, as: 'owners', attributes: ['OFirstName', 'OLastName'] },
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

exports.getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id, {
            include: [
                { model: Proaddress, as: 'proaddress' }, { model: Owner, as: 'owners' },
                { model: Loan, as: 'loans' }, { model: Auction, as: 'auctions' },
                { model: Eviction, as: 'evictions' }, { model: Violation, as: 'violations' },
                { model: Probate, as: 'probates' }, { model: Divorce, as: 'divorces' },
                { model: TaxLien, as: 'taxLiens' }, { model: MotiveTypes, as: 'motiveType' },
                { model: Auctioneer, as: 'auctioneer' }
            ]
        });
        if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
        res.json({ success: true, data: property });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id, { include: [{ model: Proaddress, as: 'proaddress' }] });
        if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

        await property.update(req.body);
        if (req.body.proaddress || req.body.trustee) {
            let proaddressData = req.body.proaddress || {};
            if (req.body.trustee) {
                const t = req.body.trustee;
                if (t.TTrusteeName) proaddressData.trusteename = t.TTrusteeName;
                if (t.TTrusteePhone) proaddressData.trusteephone = t.TTrusteePhone;
                if (t.TTrusteeAddress) proaddressData.trusteeaddress = t.TTrusteeAddress;
                if (t.TTrusteeEmail) proaddressData.trusteeemail = t.TTrusteeEmail;
            }
            if (property.proaddress) await property.proaddress.update(proaddressData);
            else {
                const newPa = await Proaddress.create(proaddressData);
                await property.setProaddress(newPa);
            }
        }

        if (req.body.owners && Array.isArray(req.body.owners)) {
            await Owner.destroy({ where: { property_id: id } });
            const ownersToCreate = req.body.owners.map(o => ({ ...o, property_id: id }));
            if (ownersToCreate.length > 0) await Owner.bulkCreate(ownersToCreate);
        }

        // Specific Associations
        const assocMap = { auctions: Auction, loans: Loan, probates: Probate, violations: Violation, evictions: Eviction, divorces: Divorce, taxLiens: TaxLien };
        for (const [key, Model] of Object.entries(assocMap)) {
            if (req.body[key] && Array.isArray(req.body[key])) {
                const propIdField = (key === 'auctions') ? 'APropertyID' : 'property_id';
                await Model.destroy({ where: { [propIdField]: id } });
                const records = req.body[key].map(r => ({ ...r, [propIdField]: id }));
                if (records.length > 0) await Model.bulkCreate(records);
            }
        }

        if (req.body.auctioneer) {
            if (property.auctioneer_id) await Auctioneer.update(req.body.auctioneer, { where: { id: property.auctioneer_id } });
            else {
                const newAuctioneer = await Auctioneer.create(req.body.auctioneer);
                await property.setAuctioneer(newAuctioneer);
            }
        }

        await activityService.logActivity('PROPERTY_UPDATE', `Property ${id} updated`, { propertyId: id });
        res.json({ success: true, data: property, warnings: req.validationWarnings });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const proaddressData = req.body.proaddress || {};
        if (req.body.trustee) {
            const t = req.body.trustee;
            if (t.TTrusteeName) proaddressData.trusteename = t.TTrusteeName;
            if (t.TTrusteePhone) proaddressData.trusteephone = t.TTrusteePhone;
            if (t.TTrusteeAddress) proaddressData.trusteeaddress = t.TTrusteeAddress;
            if (t.TTrusteeEmail) proaddressData.trusteeemail = t.TTrusteeEmail;
        }
        const proaddress = await Proaddress.create(proaddressData);
        const property = await Property.create({ ...req.body, proaddress_id: proaddress.id });
        const id = property.id;

        if (req.body.owners && Array.isArray(req.body.owners)) {
            const ownersToCreate = req.body.owners.map(o => ({ ...o, property_id: id }));
            if (ownersToCreate.length > 0) await Owner.bulkCreate(ownersToCreate);
        }

        const assocMap = { auctions: Auction, loans: Loan, probates: Probate, violations: Violation, evictions: Eviction, divorces: Divorce, taxLiens: TaxLien };
        for (const [key, Model] of Object.entries(assocMap)) {
            if (req.body[key] && Array.isArray(req.body[key])) {
                const propIdField = (key === 'auctions') ? 'APropertyID' : 'property_id';
                const records = req.body[key].map(r => ({ ...r, [propIdField]: id }));
                if (records.length > 0) await Model.bulkCreate(records);
            }
        }

        if (req.body.auctioneer) {
            const newAuctioneer = await Auctioneer.create(req.body.auctioneer);
            await property.setAuctioneer(newAuctioneer);
        }

        await activityService.logActivity('PROPERTY_CREATE', `Property ${id} created`, { propertyId: id });
        res.status(201).json({ success: true, data: property, warnings: req.validationWarnings });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id);
        if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
        await property.destroy();
        await activityService.logActivity('PROPERTY_DELETE', `Property ${id} deleted`, { propertyId: id });
        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.uploadPropertyImage = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, error: 'No image uploaded' });

        const property = await Property.findByPk(id);
        if (!property) {
            const fs = require('fs');
            if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        property.local_image_path = file.filename;
        await property.save();
        await activityService.logActivity('PROPERTY_UPDATE', `Admin uploaded image for Property ${id}`, { propertyId: id });
        res.json({ success: true, message: 'Image uploaded successfully', data: { imagePath: file.filename, fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file.filename}` } });
    } catch (err) {
        console.error('UploadPropertyImage Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deletePropertyImage = async (req, res) => {
    try {
        const { id } = req.params;
        const fs = require('fs');
        const path = require('path');
        const property = await Property.findByPk(id);
        if (!property) return res.status(404).json({ success: false, error: 'Property not found' });

        if (property.local_image_path) {
            const absolutePath = path.join(__dirname, '..', '..', 'backend', property.local_image_path);
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
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
 * ==========================================
 * AUCTION MANAGEMENT (ADMIN)
 * ==========================================
 */

exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.findAll({
            include: [{
                model: Property, as: 'property', attributes: ['id', 'PStreetAddr1', 'Pcity', 'Pstate'],
                include: [{ model: Proaddress, as: 'proaddress', attributes: ['id', 'PStreetNum', 'PStreetName', 'Pcity', 'PState', 'price'] }]
            }],
            order: [['AAuctionDateTime', 'DESC']], limit: 100
        });

        const auctionsWithStatus = auctions.map(auction => {
            const auctionData = auction.toJSON();
            const now = new Date();
            const auctionDate = new Date(auctionData.AAuctionDateTime);
            auctionData.status = (auctionDate > now) ? 'upcoming' : 'ended';
            return auctionData;
        });

        res.json({ success: true, data: auctionsWithStatus });
    } catch (err) {
        console.error('getAllAuctions Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createAuction = async (req, res) => {
    try {
        const { APropertyID, AAuctionDateTime, AAuctionPlace, minimum_bid, AAuctionCity, AAuctionState, AAuctionDescription } = req.body;
        if (!APropertyID || !AAuctionDateTime || !minimum_bid) return res.status(400).json({ success: false, error: 'Missing required fields' });

        const newAuction = await Auction.create({ APropertyID, AAuctionDateTime, AAuctionPlace, minimum_bid, AAuctionCity, AAuctionState, AAuctionDescription, status: 'upcoming' });
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
        if (!auction) return res.status(404).json({ success: false, error: 'Auction not found' });

        await auction.update(req.body);
        await activityService.logActivity('AUCTION_UPDATE', `Auction ${id} updated`, { auctionId: id });
        res.json({ success: true, data: auction });
    } catch (err) {
        console.error('updateAuction Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await Auction.findByPk(id);
        if (!auction) return res.status(404).json({ success: false, error: 'Auction not found' });
        await auction.destroy();
        await activityService.logActivity('AUCTION_DELETE', `Auction ${id} deleted`, { auctionId: id });
        res.json({ success: true, message: 'Auction deleted successfully' });
    } catch (err) {
        console.error('deleteAuction Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * ==========================================
 * OWNER & LOAN MANAGEMENT (ADMIN)
 * ==========================================
 */

exports.getAllOwners = async (req, res) => {
    try {
        const owners = await Owner.findAll({
            include: [{
                model: Property, as: 'property',
                include: [{ model: Proaddress, as: 'proaddress', attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip'] }]
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
        const owner = await Owner.findByPk(req.params.id, { include: [{ model: Property, as: 'property', include: [{ model: Proaddress, as: 'proaddress' }] }] });
        if (!owner) return res.status(404).json({ success: false, error: 'Owner not found' });
        res.json({ success: true, data: owner });
    } catch (err) {
        console.error('GetOwnerDetails Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createOwner = async (req, res) => {
    try {
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
        const owner = await Owner.findByPk(req.params.id);
        if (!owner) return res.status(404).json({ success: false, error: 'Owner not found' });
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
        const owner = await Owner.findByPk(req.params.id);
        if (!owner) return res.status(404).json({ success: false, error: 'Owner not found' });
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
        const totalOwners = await Owner.count();
        const outOfStateOwners = await Owner.count({ where: { is_out_of_state: true } });
        res.json({ success: true, data: { totalOwners, outOfStateOwners, inStateOwners: totalOwners - outOfStateOwners } });
    } catch (err) {
        console.error('GetOwnerStats Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({
            include: [{
                model: Property, as: 'property',
                include: [{ model: Proaddress, as: 'proaddress', attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip'] }]
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
        const loan = await Loan.findByPk(req.params.id, { include: [{ model: Property, as: 'property', include: [{ model: Proaddress, as: 'proaddress' }] }] });
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
        res.json({ success: true, data: loan });
    } catch (err) {
        console.error('GetLoanDetails Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createLoan = async (req, res) => {
    try {
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
        const loan = await Loan.findByPk(req.params.id);
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
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
        const loan = await Loan.findByPk(req.params.id);
        if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
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
        const totalLoans = await Loan.count();
        const totalLoanAmount = await Loan.sum('loan_amount') || 0;
        const totalArrears = await Loan.sum('arrears_amount') || 0;
        const inDefault = await Loan.count({ where: { default_status: 'In Default' } });
        res.json({ success: true, data: { totalLoans, totalLoanAmount, totalArrears, inDefault, avgLoanAmount: totalLoans > 0 ? totalLoanAmount / totalLoans : 0 } });
    } catch (err) {
        console.error('GetLoanStats Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * ==========================================
 * SUBSCRIPTION & PLANS (ADMIN)
 * ==========================================
 */

exports.getPlans = async (req, res) => {
    try {
        const plans = await Subscription.findAll({ where: { planName: ['premium', 'free'] }, order: [['price', 'ASC']] });
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
            if (plan) await plan.update({ planName, price, duration, status, description, features, popular });
        }
        if (!plan) plan = await Subscription.create({ planName, price, duration, status, description, features, popular });
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

exports.cancelSubscriberSubscription = async (req, res) => {
    try {
        const username = req.params.id;
        let user = await PremiumUser.findByPk(username);
        if (!user) return res.status(404).json({ success: false, error: 'Subscriber not found' });
        user.paymentStatus = 'cancelled';
        await user.save();
        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (err) {
        console.error('CancelSubscription Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const premium = await PremiumUser.findAll({ include: [{ model: Subscription, attributes: ['planName', 'price', 'duration'] }] });
        const allSubscribers = premium.map(p => ({
            Username: p.Username, planName: p.Subscription?.planName || 'Premium',
            status: p.paymentStatus === 'paid' ? 'active' : 'pending',
            price: p.Subscription?.price || 0, duration: p.Subscription?.duration || 'monthly',
            subscriptionStart: p.subscriptionStart, subscriptionEnd: p.subscriptionEnd, paymentStatus: p.paymentStatus
        }));
        res.json({ success: true, data: allSubscribers });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        if (req.user.UserType !== 'admin') return res.status(403).json({ success: false, error: 'Access denied' });
        const invoices = await Invoice.findAll({
            order: [['date', 'DESC']], limit: 100,
            include: [{ model: UserLogin, attributes: ['FirstName', 'LastName', 'Email'] }]
        });
        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error('Get all invoices error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch all invoices' });
    }
};

/**
 * ==========================================
 * CRAWLER & SYSTEM (ADMIN)
 * ==========================================
 */

exports.getCrawlerRuns = async (req, res) => {
    try {
        const runs = await CrawlerRun.findAll({ order: [['LastRunStart', 'DESC']], limit: 50 });
        res.json({ success: true, data: runs });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getCrawlerErrors = async (req, res) => {
    try {
        const errors = await Errors.findAll({ order: [['date_time', 'DESC']], limit: 50 });
        res.json({ success: true, data: errors });
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.importData = async (req, res) => {
    try {
        const fs = require('fs');
        const csv = require('csv-parser');
        const { Proaddress, Property, Owner, Auction, Loan, Probate, Violation, Eviction, Divorce, TaxLien, sequelize } = require('../models');
        console.log(`[IMPORT_DEBUG] DB: ${sequelize.config.database}, Host: ${sequelize.config.host}`);
        const results = [];
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

        fs.createReadStream(req.file.path).pipe(csv()).on('data', (d) => results.push(d)).on('end', async () => {
            let stats = { totalRows: results.length, properties: 0, owners: 0, auctions: 0, loans: 0, probates: 0, violations: 0, evictions: 0, divorces: 0, taxLiens: 0, errors: 0 };
            const errors = [];

            // Fetch all motive types for mapping
            const mTypes = await MotiveTypes.findAll();
            const motiveMap = {};
            mTypes.forEach(m => motiveMap[m.code] = m.id);

            for (const row of results) {
                try {
                    // 1. Handle Property/Proaddress Import
                    if (row.PStreetNum && row.PStreetName) {
                        const mCode = row.PMotiveType || row.motive_code || 'TRU';
                        const motiveId = motiveMap[mCode] || (mTypes[0] ? mTypes[0].id : 1);

                        const [pa] = await Proaddress.findOrCreate({
                            where: { PStreetNum: row.PStreetNum, PStreetName: row.PStreetName, Pcity: row.Pcity || '' },
                            defaults: {
                                PState: row.PState || '',
                                Pzip: row.Pzip || '',
                                beds: row.beds || '0',
                                baths: row.baths || '0',
                                price: row.price || 0,
                                proptype: row.proptype || '',
                                square_feet: row.square_feet || 0,
                                PMotiveType: mCode,
                                owner_name: row.owner_name || `${row.OFirstName || ''} ${row.OLastName || ''}`.trim(),
                                owner_mailing_address: row.owner_mailing_address || row.OMailingAddr1 || '',
                                owner_current_state: row.owner_current_state || row.OMailingState || '',
                                owner_phone: row.owner_phone || '',
                                PYearBuilt: row.PYearBuilt || '',
                                lot_size: row.lot_size || '',
                                trusteename: row.trusteename || '',
                                trusteeaddress: row.trusteeaddress || '',
                                trusteecity: row.trusteecity || '',
                                trusteestate: row.trusteestate || '',
                                trusteezip: row.trusteezip || '',
                                trusteephone: row.trusteephone || '',
                                trusteetype: row.trusteetype || '',
                                auction_amt: row.auction_amt || '',
                                auctiondatetime: row.auctiondatetime || null,
                                auctionplace: row.auctionplace || '',
                                auctiondescription: row.auctiondescription || '',
                                violation_complaint: row.violation_complaint || '',
                                violation_types: row.violation_types || '',
                                violation_total: row.violation_total || row.fine_amount || 0,
                                violation_desc: row.violation_desc || row.short_desc || '',
                                violation_details: row.violation_details || row.details || ''
                            }
                        });

                        const [p] = await Property.findOrCreate({
                            where: { proaddress_id: pa.id },
                            defaults: {
                                PType: row.proptype || '',
                                PTotSQFootage: row.square_feet || 0,
                                motive_type_id: motiveId
                            }
                        });
                        stats.properties++;

                        // Handle associated owner record
                        if (row.OFirstName || row.OLastName) {
                            await Owner.create({
                                OFirstName: row.OFirstName,
                                OLastName: row.OLastName,
                                OProperty_id: p.id,
                                OStreetAddr1: row.OMailingAddr1 || '',
                                OCity: row.OMailingCity || '',
                                OState: row.OMailingState || '',
                                OZip: row.OMailingZip || ''
                            });
                            stats.owners++;
                        }
                    }
                    // 2. Handle standalone motive imports (if PropertyID is provided)
                    else if (row.PropertyID) {
                        const propertyId = row.PropertyID;

                        // Auction
                        if (row.AAuctionDateTime) {
                            await Auction.create({ ...row, APropertyID: propertyId });
                            stats.auctions++;
                        }
                        // Loan
                        else if (row.loan_amount || row.total_default_amount) {
                            await Loan.create({ ...row, property_id: propertyId });
                            stats.loans++;
                        }
                        // Probate
                        else if (row.case_number && (row.executor_name || row.date_of_death)) {
                            await Probate.create({ ...row, property_id: propertyId });
                            stats.probates++;
                        }
                        // Violation
                        else if (row.types && row.fine_amount) {
                            await Violation.create({ ...row, property_id: propertyId });
                            stats.violations++;
                        }
                        // Eviction
                        else if (row.court_date && row.plaintiff_name) {
                            await Eviction.create({ ...row, property_id: propertyId });
                            stats.evictions++;
                        }
                        // Divorce
                        else if (row.case_number && row.attorney_name) {
                            await Divorce.create({ ...row, property_id: propertyId });
                            stats.divorces++;
                        }
                        // Tax Lien
                        else if (row.amount_owed && row.tax_year) {
                            await TaxLien.create({ ...row, property_id: propertyId });
                            stats.taxLiens++;
                        }
                    }
                } catch (e) {
                    stats.errors++;
                    errors.push(`Row error: ${e.message}`);
                }
            }
            fs.unlinkSync(req.file.path);
            const activityService = require('../services/AppServices_Module');
            await activityService.logActivity('IMPORT', `Bulk imported ${stats.totalRows} rows`);
            res.json({ success: true, data: { message: `Import completed`, stats, errors } });
        });
    } catch (err) {
        console.error('Import Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getImportTemplate = async (req, res) => {
    const { target } = req.params;
    let h = '';

    switch (target) {
        case 'properties':
            h = 'PStreetNum,PStreetName,Pcity,PState,Pzip,owner_name,PMotiveType,price,beds,baths,square_feet,PYearBuilt,lot_size,proptype,owner_mailing_address,owner_current_state,owner_phone,trusteename,trusteeaddress,trusteecity,trusteestate,trusteezip,trusteephone,trusteetype,auction_amt,auctiondatetime,auctionplace,auctiondescription,violation_complaint,violation_types,violation_total,violation_desc,violation_details,OFirstName,OLastName,OMailingAddr1,OMailingCity,OMailingState,OMailingZip\n';
            break;
        case 'auctions':
            h = 'PropertyID,AAuctionDateTime,AAuctionTime,AOpeningBid,AAuctionPlace,AAuctionDescription\n';
            break;
        case 'loans':
            h = 'PropertyID,deed_id,borrower_name,lender_name,lender_address,loan_amount,total_default_amount,foreclosure_stage,lis_pendens_date,arrears_amount,default_status\n';
            break;
        case 'probates':
            h = 'PropertyID,case_number,probate_court,probate_court_county,filing_date,date_of_death,estate_type,executor_name,executor_contact,estate_value,status,notes\n';
            break;
        case 'violations':
            h = 'PropertyID,complaint,issue_date,types,short_desc,fine_amount,remediation_deadline,details,current_situation,resolution_date,compliance_status\n';
            break;
        case 'evictions':
            h = 'PropertyID,court_date,court_docket,plaintiff_name,court_desc,court_room,details\n';
            break;
        case 'divorces':
            h = 'PropertyID,case_number,court_name,filing_date,legal_filing_date,attorney_name,divorce_type,petitioner_name,respondent_name,status,settlement_date,notes\n';
            break;
        case 'taxLiens':
            h = 'PropertyID,tax_year,amount_owed,last_tax_year_paid,lien_date,tax_authority,lien_number,status,sale_date,redemption_period_end,notes\n';
            break;
        case 'owners':
            h = 'PropertyID,OFirstName,OLastName,OStreetAddr1,OCity,OState,OZip\n';
            break;
        default:
            return res.status(400).json({ success: false, error: 'Invalid template target' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=template_${target}.csv`);
    res.status(200).send(h);
};

/**
 * ==========================================
 * CONTENT & FEEDBACK (ADMIN)
 * ==========================================
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
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updatePoppin = async (req, res) => {
    try {
        const poppin = await Poppin.findByPk(req.params.id);
        if (!poppin) return res.status(404).json({ success: false, message: 'Poppin not found' });
        await poppin.update(req.body);
        res.json({ success: true, data: poppin });
    } catch (err) {
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
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const activities = await AdminActivity.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
        res.json({ success: true, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getContent = async (req, res) => {
    try {
        const content = await SiteContent.findOne({ where: { key: req.params.key } });
        res.json({ success: true, data: content || { key: req.params.key, value: null } });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, contentType } = req.body;
        let content = await SiteContent.findOne({ where: { key } });
        if (content) await content.update({ value, contentType: contentType || content.contentType });
        else content = await SiteContent.create({ key, value, contentType: contentType || 'json' });
        res.json({ success: true, data: content });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.listContent = async (req, res) => {
    try {
        const content = await SiteContent.findAll({ attributes: ['key', 'contentType', 'updatedAt'], order: [['updatedAt', 'DESC']] });
        res.json({ success: true, data: content });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const content = await SiteContent.findOne({ where: { key: req.params.key } });
        if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
        await content.destroy();
        res.json({ success: true, message: 'Content deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        if (req.user.UserType !== 'admin') return res.status(403).json({ success: false, error: 'Access denied' });
        const feedback = await Feedback.findAll({ order: [['createdAt', 'DESC']], include: [{ model: UserLogin, attributes: ['FirstName', 'LastName', 'Email'] }] });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        if (req.user.UserType !== 'admin') return res.status(403).json({ success: false, error: 'Access denied' });
        const feedback = await Feedback.findByPk(req.params.id);
        if (!feedback) return res.status(404).json({ success: false, error: 'Feedback not found' });
        await feedback.update({ status: req.body.status || feedback.status, adminNotes: req.body.adminNotes || feedback.adminNotes });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed' });
    }
};

exports.getMotiveTypeRequirements = async (req, res) => {
    try {
        const { getAllMotiveTypeRules } = require('../middleware/motiveTypeValidator');
        res.json({ success: true, data: getAllMotiveTypeRules() });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getMotiveTypeRequirement = async (req, res) => {
    try {
        const { getMotiveTypeRequirements } = require('../middleware/motiveTypeValidator');
        const reqs = getMotiveTypeRequirements(req.params.code);
        if (!reqs) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: reqs });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getMotiveTypes = async (req, res) => {
    try {
        const types = await MotiveTypes.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: types });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.uploadContentImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'No file' });
        res.json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

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
        const { query, motive, minPrice, maxPrice, beds, baths, state, city, zip, minEquity, maxEquity, minDebt, maxDebt, limit = 200, offset = 0 } = req.query;
        let where = {};
        let addressWhere = {};

        if (state && state !== 'All') addressWhere.PState = state;
        if (city) addressWhere.Pcity = city;
        if (zip) {
            const zips = zip.split(',').map(z => z.trim()).filter(Boolean);
            addressWhere.Pzip = zips.length === 1 ? zips[0] : { [Op.in]: zips };
        }
        if (minPrice) addressWhere.price = { [Op.gte]: minPrice };
        if (maxPrice) addressWhere.price = { ...addressWhere.price, [Op.lte]: maxPrice };
        if (beds && beds !== 'Any') addressWhere.beds = { [Op.gte]: beds };
        if (baths && baths !== 'Any') addressWhere.baths = { [Op.gte]: baths };

        // Search query filter
        if (query) {
            addressWhere[Op.or] = [
                { Pcity: { [Op.like]: `%${query}%` } },
                { Pzip: { [Op.like]: `%${query}%` } },
                { PStreetName: { [Op.like]: `%${query}%` } },
                { owner_name: { [Op.like]: `%${query}%` } }
            ];
        }

        // Motive type filter
        let motiveWhere = undefined;
        if (motive && motive !== 'All') {
            const motives = motive.split(',').map(m => m.trim()).filter(Boolean);
            motiveWhere = motives.length === 1 ? { name: motives[0] } : { name: { [Op.in]: motives } };
        }

        const hasAddressFilter = Object.keys(addressWhere).length > 0;
        const hasMotiveFilter = !!motiveWhere;

        const properties = await Property.findAll({
            where,
            include: [
                { model: Proaddress, as: 'proaddress', required: hasAddressFilter, where: hasAddressFilter ? addressWhere : undefined },
                { model: MotiveTypes, as: 'motiveType', required: hasMotiveFilter, where: hasMotiveFilter ? motiveWhere : undefined },
                { model: Loan, as: 'loans', required: false }
            ],
            limit: parseInt(limit), offset: parseInt(offset), order: [['id', 'DESC']]
        });

        const isPremium = req.user && (req.user.UserType === 'premium' || req.user.UserType === 'admin');

        // Transform to frontend-expected format
        const data = properties.map(p => {
            const raw = p.toJSON();
            const addr = raw.proaddress || {};
            const mType = raw.motiveType || {};

            const ownerFull = addr.owner_name || 'Unknown Owner';
            const ownerParts = ownerFull.split(' ');
            const maskedOwner = ownerParts.map(part => part[0] + '****').join(' ');

            const phone = addr.owner_phone || '(555) 000-0000';
            const maskedPhone = phone.replace(/\d(?=\d{4})/g, '*');

            const appraised = parseFloat(raw.PTotAppraisedAmt || addr.price || '0');
            const totalDebt = (raw.loans || []).reduce((sum, l) => sum + parseFloat(l.loan_amount || 0), 0);
            const equity = Math.max(appraised - totalDebt, 0);
            const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

            return {
                id: raw.id,
                image: raw.local_image_path || `https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400`,
                type: mType.name || 'Unknown',
                address: isPremium ? `${addr.PStreetNum || ''} ${addr.PStreetName || ''}`.trim() : `${(addr.PStreetNum || '')[0] || ''}*** ${addr.PStreetName || ''}`.trim(),
                city: addr.Pcity || raw.Pcity || '',
                state: addr.PState || raw.Pstate || '',
                zip: addr.Pzip || raw.Pzip || '',
                beds: parseInt(addr.beds || raw.PBeds || '0'),
                baths: parseInt(addr.baths || raw.PBaths || '0'),
                sqft: parseInt(addr.square_feet || raw.PTotSQFootage || '0'),
                year: addr.PYearBuilt || raw.PYearBuilt || '',
                appraised: parseFloat(raw.PTotAppraisedAmt || addr.price || '0'),
                debt: totalDebt,
                equity: equity,
                equityPercent: equityPercent,
                auctionDate: addr.sale_date || 'Pending',
                ownerName: isPremium ? ownerFull : maskedOwner,
                ownerPhone: isPremium ? phone : maskedPhone,
                ownerEmail: isPremium ? `owner${raw.id}@example.com` : 'o****@example.com',
                saved: false
            };
        });

        // Post-query filtering for equity and debt (computed values)
        let filtered = data;
        if (minEquity && parseInt(minEquity) > 0) {
            filtered = filtered.filter(p => p.equityPercent >= parseInt(minEquity));
        }
        if (maxEquity && parseInt(maxEquity) < 100) {
            filtered = filtered.filter(p => p.equityPercent <= parseInt(maxEquity));
        }
        if (minDebt && parseInt(minDebt) > 0) {
            filtered = filtered.filter(p => p.debt === 0 || p.debt >= parseInt(minDebt));
        }
        if (maxDebt && parseInt(maxDebt) < 1000000) {
            filtered = filtered.filter(p => p.debt === 0 || p.debt <= parseInt(maxDebt));
        }

        res.json({ success: true, count: filtered.length, data: filtered });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getPropertyDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const isPremium = req.user && (req.user.UserType === 'premium' || req.user.UserType === 'admin');

        const prop = await Property.findByPk(id, {
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

        if (!prop) return res.status(404).json({ success: false, error: 'Not found' });

        const raw = prop.toJSON();
        const addr = raw.proaddress || {};
        const mType = raw.motiveType || {};
        const ownerFull = addr.owner_name || 'Unknown Owner';
        const phone = addr.owner_phone || '';
        const appraised = parseFloat(raw.PTotAppraisedAmt || addr.price || '0');

        // Build the nested structure the frontend expects
        const data = {
            id: raw.id,
            type: mType.name || 'Unknown',
            status: 'Active',
            publishedOn: addr.DATE_TIMEOFEXTRACTION || new Date().toISOString(),
            saved: false,
            motiveTypeCode: mType.code || '',
            motiveType: mType.id ? { id: mType.id, code: mType.code, name: mType.name } : undefined,

            property: {
                image: raw.local_image_path || `https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400`,
                images: raw.local_image_path ? [raw.local_image_path] : [`https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400`],
                address: isPremium ? `${addr.PStreetNum || ''} ${addr.PStreetName || ''}`.trim() : `${(addr.PStreetNum || '')[0] || ''}*** ${addr.PStreetName || ''}`.trim(),
                city: addr.Pcity || raw.Pcity || '',
                state: addr.PState || raw.Pstate || '',
                zip: addr.Pzip || raw.Pzip || '',
                county: raw.Pcounty || addr.counties || '',
                parcelNumber: raw.PListingID || '',
                legalDescription: '',
                beds: parseInt(addr.beds || raw.PBeds || '0'),
                baths: parseInt(addr.baths || raw.PBaths || '0'),
                sqft: parseInt(addr.square_feet || raw.PTotSQFootage || '0'),
                lotSize: parseFloat(raw.PTotLandArea || addr.lot_size || '0'),
                yearBuilt: parseInt(addr.PYearBuilt || raw.PYearBuilt || '0'),
                propertyType: addr.proptype || raw.PType || 'Residential',
                zoning: '',
                appraisedValue: appraised,
                taxAssessedValue: parseFloat(raw.PAppraisedLandAmt || '0') + parseFloat(raw.PAppraisedBuildingAmt || '0'),
                lastSalePrice: parseFloat(raw.PLastSoldAmt || '0'),
                lastSaleDate: raw.PLastSoldDate || null,
                local_image_path: raw.local_image_path,
                comments: raw.PComments || addr.comments || '',
                PLandBuilding: raw.PLandBuilding,
                PBase: raw.PBase,
                PAppraisedBuildingAmt: parseFloat(raw.PAppraisedBuildingAmt || '0'),
                PAppraisedLandAmt: parseFloat(raw.PAppraisedLandAmt || '0'),
                PTotLandArea: raw.PTotLandArea,
                PTotBuildingArea: raw.PTotBuildingArea,
                PLastSoldAmt: raw.PLastSoldAmt,
                PLastSoldDate: raw.PLastSoldDate,
                PListingID: raw.PListingID,
                PDateFiled: raw.PDateFiled,
                PTotAppraisedAmt: raw.PTotAppraisedAmt
            },

            owner: {
                name: isPremium ? ownerFull : ownerFull.split(' ').map(p => p[0] + '****').join(' '),
                mailingAddress: isPremium ? (addr.owner_mailing_address || '') : '****',
                mailingCity: addr.Pcity || '',
                mailingState: addr.owner_current_state || addr.PState || '',
                mailingZip: addr.Pzip || '',
                phone: isPremium ? phone : phone.replace(/\d(?=\d{4})/g, '*'),
                email: isPremium ? `owner${raw.id}@example.com` : 'o****@example.com',
                ownershipType: addr.PcompayName ? 'Corporate' : 'Individual',
                yearsOwned: 0,
                isAbsentee: !!(addr.owner_current_state && addr.owner_current_state !== addr.PState),
                isCorporate: !!addr.PcompayName,
                is_out_of_state: !!(addr.owner_current_state && addr.owner_current_state !== addr.PState)
            },

            owners: raw.owners || [],
            loans: raw.loans || [],

            financials: (() => {
                const loans = raw.loans || [];
                const totalDebt = loans.reduce((sum, l) => sum + parseFloat(l.loan_amount || 0), 0);
                const estimatedEquity = Math.max(appraised - totalDebt, 0);
                const equityPercent = appraised > 0 ? Math.round((estimatedEquity / appraised) * 100) : 0;
                const taxLiens = raw.taxLiens || [];
                const taxDelinquentAmount = taxLiens.reduce((sum, t) => sum + parseFloat(t.amount_owed || 0), 0);
                return {
                    totalDebt,
                    estimatedEquity,
                    equityPercent,
                    monthlyRent: 0,
                    hoaFees: 0,
                    propertyTaxes: parseFloat(raw.PAppraisedLandAmt || '0'),
                    taxDelinquent: taxLiens.length > 0,
                    taxDelinquentAmount
                };
            })(),

            proaddress: addr,
            auctions: raw.auctions || [],
            probates: raw.probates || [],
            violations: raw.violations || [],
            evictions: raw.evictions || [],
            divorces: raw.divorces || [],
            taxLiens: raw.taxLiens || [],

            // Convenience aliases for motive-specific detail views
            foreclosure: addr.sale_date ? {
                status: 'Active',
                filingDate: addr.DATE_TIMEOFEXTRACTION,
                auctionDate: addr.sale_date || 'Pending',
                auctionTime: addr.sale_time || '',
                auctionLocation: addr.auctionplace || '',
                defaultAmount: 0,
                trustee: addr.trusteename || '',
                trusteePhone: addr.trusteephone || '',
                documentNumber: addr.case_number || addr.deed_book_page || ''
            } : undefined,

            propertyTrustDeed: null,
            trustee: addr.trusteename ? {
                name: addr.trusteename,
                company: addr.trusteecompanyname,
                address: addr.trusteeaddress,
                city: addr.trusteecity,
                state: addr.trusteestate,
                zip: addr.trusteezip,
                phone: addr.trusteephone,
                email: addr.trusteeemail,
                website: addr.trusteewebsite,
                type: addr.trusteetype
            } : null,

            auctioneer: addr.auctioneername ? {
                name: addr.auctioneername,
                company: addr.auctioneercompanyname,
                address: addr.auctioneeraddress,
                phone: addr.auctioneerphone,
                email: addr.auctioneeremail,
                website: addr.auctioneerweb_site
            } : null
        };

        res.json({ success: true, data, isMasked: !isPremium });
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
        const isPremium = req.user.UserType === 'premium' || req.user.UserType === 'admin';
        const saved = await SavedProperty.findAll({
            where: { Username },
            include: [{ model: Property, as: 'property', include: [{ model: Proaddress, as: 'proaddress' }, { model: MotiveTypes, as: 'motiveType' }] }],
            order: [['createdAt', 'DESC']]
        });

        // Transform to flat SavedLead format the frontend expects
        const data = saved.map(s => {
            const raw = s.toJSON();
            const prop = raw.property || {};
            const addr = prop.proaddress || {};
            const mType = prop.motiveType || {};
            const ownerFull = addr.owner_name || 'Unknown Owner';

            return {
                id: prop.id || raw.propertyId,
                savedId: raw.id,
                savedOn: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
                image: prop.local_image_path || `https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400`,
                type: mType.name || 'Unknown',
                address: isPremium ? `${addr.PStreetNum || ''} ${addr.PStreetName || ''}`.trim() : `${(addr.PStreetNum || '')[0] || ''}*** ${addr.PStreetName || ''}`.trim(),
                city: addr.Pcity || prop.Pcity || '',
                state: addr.PState || prop.Pstate || '',
                zip: addr.Pzip || prop.Pzip || '',
                beds: parseInt(addr.beds || prop.PBeds || '0'),
                baths: parseInt(addr.baths || prop.PBaths || '0'),
                sqft: parseInt(addr.square_feet || prop.PTotSQFootage || '0'),
                appraised: parseFloat(prop.PTotAppraisedAmt || addr.price || '0'),
                debt: 0,
                ownerName: isPremium ? ownerFull : ownerFull.split(' ').map(p => p[0] + '****').join(' '),
                ownerPhone: isPremium ? (addr.owner_phone || '') : '****',
                saved: true
            };
        });

        res.json({ success: true, data });
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

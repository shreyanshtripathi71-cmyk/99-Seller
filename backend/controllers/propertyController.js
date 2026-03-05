const { Property, Proaddress, Owner, Loan, MotiveTypes, Auction, Auctioneer, Site, SavedProperty, Eviction, Violation, Trustee, Probate, Divorce, TaxLien, PremiumUser, PropertyTrustDeed, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Helper to mask sensitive data for non-premium users
 */
const maskValue = (value, type = 'default') => {
    if (!value || value === '---' || value === 'Unknown') return value;
    if (type === 'phone') return `(***) ***-${value.slice(-4)}`;
    if (type === 'email') {
        const atIndex = value.indexOf('@');
        if (atIndex <= 0) return "****@****.com";
        return value[0] + "****" + value.substring(atIndex);
    }
    if (type === 'address') {
        const parts = value.split(" ");
        if (parts.length > 1) {
            const streetNum = parts[0];
            return streetNum.substring(0, 1) + "*** " + parts.slice(1).join(" ");
        }
        return "*** " + value.substring(3);
    }
    // Name masking
    const parts = value.split(" ");
    return parts.map(part => part[0] + "****").join(" ");
};

/**
 * Search properties with filters and calculate equity
 * @route GET /api/properties
 */
exports.searchProperties = async (req, res) => {
    try {
        const {
            state,
            city,
            zip,
            motive,
            minEquity,
            maxEquity,
            minDebt,
            maxDebt,
            minBeds,
            minBaths,
            minSqft,
            minYear,
            q // General search query
        } = req.query;

        const whereClause = {};
        if (q) {
            whereClause[Op.or] = [
                { PStreetAddr1: { [Op.like]: `%${q}%` } },
                { Pcity: { [Op.like]: `%${q}%` } },
                { Pzip: { [Op.like]: `%${q}%` } }
            ];
        }

        if (state && state !== 'All') whereClause.Pstate = state;
        if (city) whereClause.Pcity = { [Op.like]: `%${city}%` };
        if (zip) {
            const zips = zip.split(',').map(z => z.trim()).filter(Boolean);
            if (zips.length === 1) {
                whereClause.Pzip = { [Op.like]: `%${zips[0]}%` };
            } else if (zips.length > 1) {
                whereClause.Pzip = { [Op.in]: zips };
            }
        }
        if (minBeds && minBeds !== 'Any') whereClause.PBeds = { [Op.gte]: parseInt(minBeds) };
        if (minBaths && minBaths !== 'Any') whereClause.PBaths = { [Op.gte]: parseFloat(minBaths) };
        if (minSqft) whereClause.PTotSQFootage = { [Op.gte]: parseInt(minSqft) };
        if (minYear) whereClause.PYearBuilt = { [Op.gte]: parseInt(minYear) };

        const motiveInclude = { model: MotiveTypes, as: 'motiveType', attributes: ['id', 'name'] };
        if (motive && motive !== 'All') {
            const motives = motive.split(',').map(m => m.trim()).filter(Boolean);
            if (motives.length === 1) {
                motiveInclude.where = { name: motives[0] };
            } else if (motives.length > 1) {
                motiveInclude.where = { name: { [Op.in]: motives } };
            }
        }

        let savedPropertyIds = new Set();
        if (req.user && req.user.Username) {
            const savedProps = await SavedProperty.findAll({
                where: { Username: req.user.Username },
                attributes: ['propertyId']
            });
            savedPropertyIds = new Set(savedProps.map(sp => sp.propertyId));
        }

        const properties = await Property.findAll({
            where: whereClause,
            include: [
                motiveInclude,
                { model: Proaddress, as: 'proaddress', attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip', 'beds', 'baths', 'price', 'proptype', 'square_feet', 'owner_name', 'owner_phone'] },
                { model: Owner, as: 'owners', attributes: ['OFirstName', 'OLastName'] },
                { model: Loan, as: 'loans', attributes: ['loan_amount'] },
                { model: Auction, as: 'auctions', attributes: ['AAuctionDateTime'], limit: 1, order: [['AAuctionDateTime', 'DESC']] }
            ],
            order: [['id', 'DESC']],
            limit: 100
        });

        let isPremium = req.user && (req.user.UserType === 'premium' || req.user.UserType === 'admin');
        if (!isPremium && req.user) {
            try {
                const username = req.user.Username;
                const premiums = await PremiumUser.findAll({ where: { Username: { [Op.or]: [username, username.toLowerCase(), username.toUpperCase()] } } });
                if (premiums && premiums.length > 0) isPremium = true;
            } catch (err) { console.error(err); }
        }

        const results = properties.map(property => {
            const appraised = parseFloat(property.PTotAppraisedAmt || property.proaddress?.price || 0);
            const totalDebt = (property.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
            const equity = appraised - totalDebt;
            const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

            return {
                id: property.id,
                image: property.local_image_path ? `${req.protocol}://${req.get('host')}/uploads/${property.local_image_path}` : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
                type: property.motiveType?.name || 'Unknown',
                address: isPremium ? (property.PStreetAddr1 || (property.proaddress ? `${property.proaddress.PStreetNum} ${property.proaddress.PStreetName}` : 'Address Unknown')) : maskValue(property.PStreetAddr1 || (property.proaddress ? `${property.proaddress.PStreetNum} ${property.proaddress.PStreetName}` : 'Address Unknown'), 'address'),
                city: property.Pcity || property.proaddress?.Pcity || '',
                state: property.Pstate || property.proaddress?.PState || '',
                zip: property.Pzip || property.proaddress?.Pzip || '',
                beds: parseInt(property.PBeds || property.proaddress?.beds || 0),
                baths: parseFloat(property.PBaths || property.proaddress?.baths || 0),
                appraised: appraised,
                debt: totalDebt,
                equity: equity,
                equityPercent: equityPercent,
                sqft: parseInt(property.PTotSQFootage || property.proaddress?.square_feet || 0),
                year: property.PYearBuilt || 'N/A',
                auctionDate: property.auctions?.[0]?.AAuctionDateTime ? new Date(property.auctions[0].AAuctionDateTime).toLocaleDateString() : 'Pending',
                publishedOn: property.PDateFiled ? new Date(property.PDateFiled).toLocaleDateString() : 'Unknown',
                saved: savedPropertyIds.has(property.id),
                ownerName: isPremium ? (property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : 'Unknown') : maskValue(property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : 'John Smith'),
                ownerPhone: isPremium ? (property.owners?.[0]?.OCellPhone || '---') : maskValue(property.owners?.[0]?.OCellPhone || '(555) 123-4567', 'phone'),
                ownerEmail: isPremium ? (property.owners?.[0]?.OEmailAddr || '---') : maskValue(property.owners?.[0]?.OEmailAddr || 'owner@example.com', 'email')
            };
        });

        let filteredResults = results;
        if (minEquity) filteredResults = filteredResults.filter(r => r.equityPercent >= parseInt(minEquity));
        if (maxEquity && parseInt(maxEquity) < 100) filteredResults = filteredResults.filter(r => r.equityPercent <= parseInt(maxEquity));
        if (minDebt) filteredResults = filteredResults.filter(r => r.debt >= parseInt(minDebt));
        if (maxDebt) filteredResults = filteredResults.filter(r => r.debt <= parseInt(maxDebt));

        res.json({ success: true, count: filteredResults.length, data: filteredResults });
    } catch (err) {
        console.error('SearchProperties Error:', err);
        res.status(500).json({ success: false, error: 'Server Error', details: err.message });
    }
};

/**
 * Get single property by ID
 * @route GET /api/properties/:id
 */
exports.getProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findByPk(id, {
            include: [
                { model: MotiveTypes, as: 'motiveType', attributes: ['id', 'name', 'code'] },
                {
                    model: Proaddress, as: 'proaddress', include: [
                        { model: PropertyTrustDeed, as: 'propertyTrustDeed' },
                        { model: Site, as: 'site' }
                    ]
                },
                { model: Owner, as: 'owners' },
                { model: Loan, as: 'loans' },
                { model: Auction, as: 'auctions', limit: 1, order: [['AAuctionDateTime', 'DESC']] },
                { model: Auctioneer, as: 'auctioneer' },
                { model: Eviction, as: 'evictions' },
                { model: Violation, as: 'violations' },
                { model: Probate, as: 'probates' },
                { model: Divorce, as: 'divorces' },
                { model: TaxLien, as: 'taxLiens' }
            ]
        });

        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        const appraised = parseFloat(property.PTotAppraisedAmt || property.proaddress?.price || 0);
        const totalDebt = (property.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
        const equity = appraised - totalDebt;
        const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

        let isPremium = req.user && (req.user.UserType === 'premium' || req.user.UserType === 'admin');
        if (!isPremium && req.user) {
            try {
                const username = req.user.Username;
                const premiums = await PremiumUser.findAll({ where: { Username: { [Op.or]: [username, username.toLowerCase(), username.toUpperCase()] } } });
                if (premiums && premiums.length > 0) isPremium = true;
            } catch (err) { console.error(err); }
        }

        const mainImage = property.local_image_path ? `${req.protocol}://${req.get('host')}/uploads/${property.local_image_path}` : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800";

        const data = {
            id: property.id,
            type: property.motiveType?.name || 'Unknown',
            motiveTypeCode: property.motiveType?.code || 'UNK',
            property: {
                ...property.dataValues,
                image: mainImage,
                images: [mainImage, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
                address: isPremium ? (property.PStreetAddr1 || (property.proaddress ? `${property.proaddress.PStreetNum} ${property.proaddress.PStreetName}` : 'Address Unknown')) : maskValue(property.PStreetAddr1 || (property.proaddress ? `${property.proaddress.PStreetNum} ${property.proaddress.PStreetName}` : 'Address Unknown'), 'address'),
                city: property.Pcity || property.proaddress?.Pcity,
                state: property.Pstate || property.proaddress?.PState,
                zip: property.Pzip || property.proaddress?.Pzip,
                county: property.Pcounty || property.proaddress?.counties || 'Unknown',
                parcelNumber: property.PListingID || property.proaddress?.listing_id || 'Unknown',
                legalDescription: property.PComments || property.proaddress?.violation_desc || 'Unknown',
                beds: parseInt(property.PBeds || property.proaddress?.beds || 0),
                baths: parseFloat(property.PBaths || property.proaddress?.baths || 0),
                sqft: parseInt(property.PTotSQFootage || property.proaddress?.square_feet || 0),
                lotSize: parseFloat(property.PAcreage || property.proaddress?.lot_size || 0),
                yearBuilt: property.PYearBuilt || property.proaddress?.PYearBuilt || 'Unknown',
                propertyType: property.PType || property.proaddress?.proptype || 'Single Family',
                appraisedValue: appraised,
                taxAssessedValue: property.PTotAppraisedAmt ? parseFloat(property.PTotAppraisedAmt) : (property.proaddress?.price ? parseFloat(property.proaddress.price) * 0.8 : 0),
                landArea: property.PTotLandArea || property.proaddress?.lot_size || 'N/A',
                buildingArea: property.PTotBuildingArea || (property.proaddress?.square_feet ? `${property.proaddress.square_feet} sqft` : 'N/A'),
                caseNumber: property.proaddress?.case_number || 'N/A',
                deedBook: property.proaddress?.deed_book_page || 'N/A'
            },
            owner: {
                name: isPremium ? (property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : (property.proaddress?.owner_name || 'Unknown')) : maskValue(property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : (property.proaddress?.owner_name || 'John Smith'), 'name'),
                // Prioritize Mailing Address as per user request
                mailingAddress: isPremium ? (property.proaddress?.owner_mailing_address || property.owners?.[0]?.OStreetAddr1 || property.PStreetAddr1) : maskValue(property.proaddress?.owner_mailing_address || property.owners?.[0]?.OStreetAddr1 || property.PStreetAddr1, 'address'),
                mailingCity: property.proaddress?.owner_mailing_city || property.owners?.[0]?.OCity || property.proaddress?.Pcity || property.Pcity,
                mailingState: property.proaddress?.owner_mailing_state || property.owners?.[0]?.OState || property.proaddress?.PState || property.Pstate,
                mailingZip: property.proaddress?.owner_mailing_zip || property.owners?.[0]?.OZip || property.proaddress?.Pzip || property.Pzip,
                phone: isPremium ? (property.proaddress?.owner_phone || property.owners?.[0]?.OCellPhone) : maskValue(property.proaddress?.owner_phone || property.owners?.[0]?.OCellPhone || '(555) 123-4567', 'phone'),
                email: isPremium ? (property.proaddress?.owner_email || property.owners?.[0]?.OEmailAddr) : maskValue(property.proaddress?.owner_email || property.owners?.[0]?.OEmailAddr || 'owner@example.com', 'email'),
                ownershipType: property.proaddress?.trusteetype || 'Individual',
                isAbsentee: true,
                isCorporate: !!(property.proaddress?.PcompayName)
            },
            financials: {
                totalDebt,
                estimatedEquity: equity,
                equityPercent,
                propertyTaxes: parseFloat(property.PTaxAmt || 0),
            },
            loans: (property.loans || []).map((l, i) => ({
                ...l.toJSON(),
                loanNumber: i + 1,
                lender: l.lender_name || 'Unknown',
                loanAmount: parseFloat(l.loan_amount || 0),
                position: i === 0 ? "1st" : "2nd"
            })),
            propertyTrustDeed: property.proaddress?.propertyTrustDeed ? {
                ...property.proaddress.propertyTrustDeed.toJSON(),
                documentUrl: property.proaddress.propertyTrustDeed.local_document_path
                    ? `${req.protocol}://${req.get('host')}/uploads/${property.proaddress.propertyTrustDeed.local_document_path}`
                    : `${req.protocol}://${req.get('host')}/uploads/deeds/deed_${property.id}.pdf`
            } : {
                documentUrl: `${req.protocol}://${req.get('host')}/uploads/deeds/deed_${property.id}.pdf`
            },
            publishedOn: property.PDateFiled || property.createdAt,
            proaddress: property.proaddress,
            auctions: property.auctions,
            probates: property.probates,
            divorces: property.divorces,
            evictions: property.evictions,
            violations: property.violations,
            taxLiens: property.taxLiens,
            trustee: {
                ...(property.proaddress?.propertyTrustDeed ? property.proaddress.propertyTrustDeed.toJSON() : {}),
                TTrusteeName: property.proaddress?.trusteename,
                TTrusteePhone: property.proaddress?.trusteephone,
                TTrusteeEmail: property.proaddress?.trusteeemail,
                TTrusteeWebSite: property.proaddress?.trusteewebsite,
                trusteetype: property.proaddress?.trusteetype
            },
            auctioneer: property.auctioneer ? {
                // Full Auctioneer model record (has html, web_site, type, etc.)
                ...property.auctioneer.toJSON(),
                // Alias for the frontend (web_site → website for easier access)
                website: property.auctioneer.web_site,
                company: property.proaddress?.auctioneercompanyname
            } : {
                // Fallback from proaddress fields if no Auctioneer FK record
                name: property.proaddress?.auctioneername,
                phone: property.proaddress?.auctioneerphone,
                email: property.proaddress?.auctioneeremail,
                company: property.proaddress?.auctioneercompanyname,
                address: property.proaddress?.auctioneeraddress,
                website: property.proaddress?.auctioneerweb_site,
                html: property.proaddress?.auctioneerhtml
            },
            site: property.proaddress?.site
        };

        let isSaved = false;
        if (req.user && req.user.Username) {
            const savedRecord = await SavedProperty.findOne({ where: { Username: req.user.Username, propertyId: id } });
            isSaved = !!savedRecord;
        }
        data.saved = isSaved;

        const motiveCode = property.motiveType?.code;
        // Refined Foreclosure Logic: "Pending" if no auction, "Foreclosure" if auction exists
        if (motiveCode === 'FOR' || motiveCode === 'PRE' || motiveCode === 'AUC') {
            const hasAuction = property.auctions && property.auctions.length > 0;
            data.foreclosure = {
                status: hasAuction ? 'Foreclosure' : 'Pending',
                auctionDate: hasAuction ? property.auctions[0].AAuctionDateTime : null,
                auctionTime: hasAuction ? new Date(property.auctions[0].AAuctionDateTime).toLocaleTimeString() : null,
                auctionLocation: hasAuction ? property.auctions[0].AAuctionPlace : null,
                defaultAmount: hasAuction ? parseFloat(property.auctions[0].ABid || 0) : parseFloat(property.proaddress?.auction_amt || 0)
            };
        }
        if (motiveCode === 'PRO' && property.probates?.[0]) {
            data.probate = { caseNumber: property.probates[0].case_number, court: property.probates[0].probate_court, filingDate: property.probates[0].filing_date, estateType: property.probates[0].estate_type, executor: property.probates[0].executor_name, executorContact: property.probates[0].executor_contact, estateValue: parseFloat(property.probates[0].estate_value || 0), status: property.probates[0].status };
        }
        if (motiveCode === 'DIV' && property.divorces?.[0]) {
            data.divorce = { caseNumber: property.divorces[0].case_number, court: property.divorces[0].court_name, filingDate: property.divorces[0].filing_date, type: property.divorces[0].divorce_type, petitioner: property.divorces[0].petitioner_name, respondent: property.divorces[0].respondent_name, status: property.divorces[0].status, settlementDate: property.divorces[0].settlement_date };
        }
        if (motiveCode === 'TAX' && property.taxLiens?.[0]) {
            data.taxLien = { taxYear: property.taxLiens[0].tax_year, amountOwed: parseFloat(property.taxLiens[0].amount_owed || 0), lienDate: property.taxLiens[0].lien_date, authority: property.taxLiens[0].tax_authority, lienNumber: property.taxLiens[0].lien_number, status: property.taxLiens[0].status, saleDate: property.taxLiens[0].sale_date, redemptionEnd: property.taxLiens[0].redemption_period_end };
        }
        if (motiveCode === 'EVI' && property.evictions?.[0]) {
            data.eviction = { courtDate: property.evictions[0].court_date, docket: property.evictions[0].court_docket, description: property.evictions[0].court_desc, courtRoom: property.evictions[0].court_room, details: property.evictions[0].details };
        }
        if (motiveCode === 'COD' && property.violations?.[0]) {
            data.codeViolation = { complaint: property.violations[0].complaint, issueDate: property.violations[0].issue_date, type: property.violations[0].types, description: property.violations[0].short_desc, details: property.violations[0].details, currentSituation: property.violations[0].current_situation, resolutionDate: property.violations[0].resolution_date, complianceStatus: property.violations[0].compliance_status };
        }
        if (motiveCode === 'OUT' && property.owners?.[0]) data.owner.isOutOfState = property.owners[0].is_out_of_state || false;

        res.json({ success: true, data });
    } catch (err) {
        console.error('GetProperty Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

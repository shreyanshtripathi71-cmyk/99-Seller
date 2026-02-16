const { Property, Proaddress, Owner, Loan, MotiveTypes, Auction, Auctioneer, SavedProperty, Eviction, Violation, Trustee, Probate, Divorce, TaxLien, PremiumUser, sequelize } = require('../models');
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
            maxDebt,
            minBeds,
            minBaths,
            minSqft,
            minYear,
            q // General search query
        } = req.query;

        // Base where clause for Property
        const whereClause = {};

        // General search query (Street, City, Zip)
        if (q) {
            whereClause[Op.or] = [
                { PStreetAddr1: { [Op.like]: `%${q}%` } },
                { Pcity: { [Op.like]: `%${q}%` } },
                { Pzip: { [Op.like]: `%${q}%` } }
            ];
        }

        // Filters
        if (state && state !== 'All') whereClause.Pstate = state;
        if (city) whereClause.Pcity = { [Op.like]: `%${city}%` };
        if (zip) whereClause.Pzip = { [Op.like]: `%${zip}%` };
        if (minBeds && minBeds !== 'Any') whereClause.PBeds = { [Op.gte]: parseInt(minBeds) };
        if (minBaths && minBaths !== 'Any') whereClause.PBaths = { [Op.gte]: parseFloat(minBaths) };
        if (minSqft) whereClause.PTotSQFootage = { [Op.gte]: parseInt(minSqft) };
        if (minYear) whereClause.PYearBuilt = { [Op.gte]: parseInt(minYear) };

        // Motive Filter (requires join)
        const motiveInclude = {
            model: MotiveTypes,
            as: 'motiveType',
            attributes: ['id', 'name']
        };
        if (motive && motive !== 'All') {
            motiveInclude.where = { name: motive };
        }

        // Fetch saved property IDs for the current user if authenticated
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
                {
                    model: Proaddress,
                    as: 'proaddress',
                    attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip', 'beds', 'baths', 'price', 'proptype', 'square_feet', 'owner_name', 'owner_phone']
                },
                {
                    model: Owner,
                    as: 'owners',
                    attributes: ['OFirstName', 'OLastName']
                },
                {
                    model: Loan,
                    as: 'loans',
                    attributes: ['loan_amount']
                },
                {
                    model: Auction,
                    as: 'auctions',
                    attributes: ['AAuctionDateTime'],
                    limit: 1,
                    order: [['AAuctionDateTime', 'DESC']]
                }
            ],
            order: [['id', 'DESC']],
            limit: 100
        });

        // Calculate equity and format results
        let isPremium = req.user && (req.user.UserType === 'premium' || req.user.UserType === 'admin');

        // Robust Premium Check (Case Insensitive)
        if (!isPremium && req.user) {
            try {
                const username = req.user.Username;
                const premiums = await PremiumUser.findAll({
                    where: {
                        Username: { [Op.or]: [username, username.toLowerCase(), username.toUpperCase()] }
                    }
                });

                if (premiums && premiums.length > 0) {
                    isPremium = true;
                }
            } catch (err) {
                console.error(`Error checking premium status:`, err);
            }
        }

        const results = properties.map(property => {
            const appraised = parseFloat(property.PTotAppraisedAmt || property.proaddress?.price || 0);
            const totalDebt = (property.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
            const equity = appraised - totalDebt;
            const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

            return {
                id: property.id,
                image: property.local_image_path
                    ? `${req.protocol}://${req.get('host')}/uploads/${property.local_image_path}`
                    : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400", // Fallback
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
                saved: savedPropertyIds.has(property.id), // Checked against Set of saved IDs
                ownerName: isPremium ? (property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : 'Unknown') : maskValue(property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : 'John Smith'),
                ownerPhone: isPremium ? (property.owners?.[0]?.OCellPhone || '---') : maskValue(property.owners?.[0]?.OCellPhone || '(555) 123-4567', 'phone'),
                ownerEmail: isPremium ? (property.owners?.[0]?.OEmailAddr || '---') : maskValue(property.owners?.[0]?.OEmailAddr || 'owner@example.com', 'email')
            };
        });

        // Apply post-fetch filters (Equity/Debt)
        let filteredResults = results;
        if (minEquity) {
            filteredResults = filteredResults.filter(r => r.equityPercent >= parseInt(minEquity));
        }
        if (maxDebt) {
            filteredResults = filteredResults.filter(r => r.debt <= parseInt(maxDebt));
        }

        res.json({
            success: true,
            count: filteredResults.length,
            data: filteredResults
        });
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
    console.log(`[GET_PROPERTY] Fetching ID: ${req.params.id}`);
    try {
        const { id } = req.params;

        console.log(`[GET_PROPERTY] Querying DB for ID: ${id}`);
        const property = await Property.findByPk(id, {
            include: [
                { model: MotiveTypes, as: 'motiveType', attributes: ['id', 'name', 'code'] },
                { model: Proaddress, as: 'proaddress' },
                { model: Owner, as: 'owners' },
                { model: Loan, as: 'loans' },
                { model: Auction, as: 'auctions', limit: 1, order: [['AAuctionDateTime', 'DESC']] },
                { model: Eviction, as: 'evictions' },
                { model: Violation, as: 'violations' },
                { model: Probate, as: 'probates' },
                { model: Divorce, as: 'divorces' },
                { model: TaxLien, as: 'taxLiens' }
            ]
        });

        if (!property) {
            console.log(`[GET_PROPERTY] Property ${id} not found`);
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        console.log(`[GET_PROPERTY] Found property ${id}. Calculating financials...`);
        // Calculate financials
        const appraised = parseFloat(property.PTotAppraisedAmt || property.proaddress?.price || 0);
        const totalDebt = (property.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
        const equity = appraised - totalDebt;
        const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

        console.log(`[GET_PROPERTY] Financials calculated. Constructing data object...`);
        let isPremium = req.user && (req.user.UserType === 'premium' || req.user.UserType === 'admin');

        // DOUBLE CHECK: If user is 'free' in UserLogin, check PremiumUser table just in case
        // DOUBLE CHECK: If user is 'free' in UserLogin, check PremiumUser table just in case
        // DOUBLE CHECK: If user is 'free' in UserLogin, check PremiumUser table just in case
        // DIRECT OVERRIDE: If the user exists in PremiumUser table, they are PREMIUM.
        // DOUBLE CHECK: If user is 'free' in UserLogin, check PremiumUser table just in case
        // DIRECT OVERRIDE: If the user exists in PremiumUser table, they are PREMIUM.
        if (!isPremium && req.user) {
            try {
                // Check if ANY record exists in PremiumUser for this user (Case Insensitive attempt)
                const username = req.user.Username;
                const premiums = await PremiumUser.findAll({
                    where: {
                        Username: { [Op.or]: [username, username.toLowerCase(), username.toUpperCase()] }
                    }
                });

                if (premiums && premiums.length > 0) {
                    console.log(`[PREMIUM_OVERRIDE] Found PremiumUser record for ${username}. Unmasking data.`);
                    isPremium = true;
                } else {
                    console.log(`[PREMIUM_OVERRIDE] No PremiumUser record found for ${username} (checked variants).`);
                }
            } catch (err) {
                console.error(`Error checking premium status:`, err);
            }
        }

        // Check for local image
        const mainImage = property.local_image_path
            ? `${req.protocol}://${req.get('host')}/uploads/${property.local_image_path}`
            : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800";

        // Construct detailed response
        const data = {
            id: property.id,
            property: {
                image: mainImage,
                images: [
                    mainImage,
                    // Keep one fallback for gallery variety if needed, or just duplicate
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                ],
                address: isPremium ? (property.PStreetAddr1 || (property.proaddress ? property.proaddress.PStreetNum + ' ' + property.proaddress.PStreetName : 'Address Unknown')) : maskValue(property.PStreetAddr1 || (property.proaddress ? property.proaddress.PStreetNum + ' ' + property.proaddress.PStreetName : 'Address Unknown'), 'address'),
                city: property.Pcity || property.proaddress?.Pcity,
                state: property.Pstate || property.proaddress?.PState,
                zip: property.Pzip || property.proaddress?.Pzip,
                county: property.proaddress?.county || 'Unknown',
                parcelNumber: property.PParcelID || 'Unknown',
                legalDescription: property.PLegalDesc || 'Unknown',
                beds: parseInt(property.PBeds || property.proaddress?.beds || 0),
                baths: parseFloat(property.PBaths || property.proaddress?.baths || 0),
                sqft: parseInt(property.PTotSQFootage || property.proaddress?.square_feet || 0),
                lotSize: parseFloat(property.PAcreage || 0),
                yearBuilt: parseInt(property.PYearBuilt || 0),
                propertyType: property.proaddress?.proptype || 'Single Family',
                zoning: property.PZoning || 'Residential',
                appraisedValue: appraised,
                taxAssessedValue: parseFloat(property.PTotAssessedValue || 0),
                lastSalePrice: parseFloat(property.PLastSalePrice || 0),
                lastSaleDate: property.PLastSaleDate || null
            },
            owner: {
                name: isPremium ? (property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : 'Unknown') : maskValue(property.owners?.[0] ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}` : 'John Smith'),
                mailingAddress: isPremium ? (property.owners?.[0]?.OMailAddr1 || property.PStreetAddr1) : maskValue(property.owners?.[0]?.OMailAddr1 || property.PStreetAddr1, 'address'),
                mailingCity: property.owners?.[0]?.OMailCity || property.Pcity,
                mailingState: property.owners?.[0]?.OMailState || property.Pstate,
                mailingZip: property.owners?.[0]?.OMailZip || property.Pzip,
                phone: isPremium ? property.owners?.[0]?.OCellPhone : maskValue(property.owners?.[0]?.OCellPhone || '(555) 123-4567', 'phone'),
                email: isPremium ? property.owners?.[0]?.OEmailAddr : maskValue(property.owners?.[0]?.OEmailAddr || 'owner@example.com', 'email'),
                ownershipType: property.owners?.[0]?.OType || 'Individual',
                yearsOwned: 0,
                isAbsentee: property.PStreetAddr1 !== property.owners?.[0]?.OMailAddr1,
                isCorporate: (property.owners?.[0]?.OType || '').includes('CORP') || (property.owners?.[0]?.OType || '').includes('LLC')
            },
            financials: {
                totalDebt,
                estimatedEquity: equity,
                equityPercent,
                propertyTaxes: parseFloat(property.PTaxAmt || 0),
                taxDelinquent: false
            },
            loans: (property.loans || []).map((l, i) => ({
                loanNumber: i + 1,
                lender: l.lender_name || 'Unknown',
                loanAmount: parseFloat(l.loan_amount || 0),
                loanDate: l.loan_date,
                loanType: l.loan_type || 'Conventional',
                interestRate: parseFloat(l.interest_rate || 0),
                maturityDate: l.loan_due_date,
                position: i === 0 ? "1st" : "2nd"
            })),
            type: property.motiveType?.name || 'Unknown',
            motiveTypeCode: property.motiveType?.code || 'UNK',
            publishedOn: property.PDateFiled || property.createdAt,
            // Pass raw objects for full data access
            proaddress: property.proaddress,
            // Pass raw arrays for frontend motive sections
            auctions: property.auctions,
            probates: property.probates,
            divorces: property.divorces,
            evictions: property.evictions,
            violations: property.violations,
            taxLiens: property.taxLiens,
            loans: property.loans,
            trustee: property.trustee,
            auctioneer: property.auctioneer
        };

        console.log(`[GET_PROPERTY] Data object constructed. Checking saved status...`);

        // Check if this property is saved by the user (if authenticated)
        let isSaved = false;
        if (req.user && req.user.Username) {
            const savedRecord = await SavedProperty.findOne({
                where: {
                    Username: req.user.Username,
                    propertyId: id
                }
            });
            isSaved = !!savedRecord;
        }

        data.saved = isSaved;
        console.log(`[GET_PROPERTY] Saved status: ${isSaved}. Sending response...`);

        // Add motive type-specific data based on motive type
        const motiveCode = property.motiveType?.code;

        // Foreclosure & Preforeclosure - add auction data
        if ((motiveCode === 'FOR' || motiveCode === 'PRE' || motiveCode === 'AUC') && property.auctions?.[0]) {
            data.foreclosure = {
                auctionDate: property.auctions[0].AAuctionDateTime,
                auctionTime: new Date(property.auctions[0].AAuctionDateTime).toLocaleTimeString(),
                auctionLocation: property.auctions[0].AAuctionPlace,
                status: 'Scheduled',
                defaultAmount: parseFloat(property.auctions[0].ABid || 0)
            };
        }

        // Probate - add probate case data
        if (motiveCode === 'PRO' && property.probates?.[0]) {
            data.probate = {
                caseNumber: property.probates[0].case_number,
                court: property.probates[0].probate_court,
                filingDate: property.probates[0].filing_date,
                estateType: property.probates[0].estate_type,
                executor: property.probates[0].executor_name,
                executorContact: property.probates[0].executor_contact,
                estateValue: parseFloat(property.probates[0].estate_value || 0),
                status: property.probates[0].status
            };
        }

        // Divorce - add divorce case data
        if (motiveCode === 'DIV' && property.divorces?.[0]) {
            data.divorce = {
                caseNumber: property.divorces[0].case_number,
                court: property.divorces[0].court_name,
                filingDate: property.divorces[0].filing_date,
                type: property.divorces[0].divorce_type,
                petitioner: property.divorces[0].petitioner_name,
                respondent: property.divorces[0].respondent_name,
                status: property.divorces[0].status,
                settlementDate: property.divorces[0].settlement_date
            };
        }

        // Unpaid Taxes - add tax lien data
        if (motiveCode === 'TAX' && property.taxLiens?.[0]) {
            data.taxLien = {
                taxYear: property.taxLiens[0].tax_year,
                amountOwed: parseFloat(property.taxLiens[0].amount_owed || 0),
                lienDate: property.taxLiens[0].lien_date,
                authority: property.taxLiens[0].tax_authority,
                lienNumber: property.taxLiens[0].lien_number,
                status: property.taxLiens[0].status,
                saleDate: property.taxLiens[0].sale_date,
                redemptionEnd: property.taxLiens[0].redemption_period_end
            };
        }

        // Eviction - add eviction data
        if (motiveCode === 'EVI' && property.evictions?.[0]) {
            data.eviction = {
                courtDate: property.evictions[0].court_date,
                docket: property.evictions[0].court_docket,
                description: property.evictions[0].court_desc,
                courtRoom: property.evictions[0].court_room,
                details: property.evictions[0].details
            };
        }

        // Code Violations - add violation data
        if (motiveCode === 'COD' && property.violations?.[0]) {
            data.codeViolation = {
                complaint: property.violations[0].complaint,
                issueDate: property.violations[0].issue_date,
                type: property.violations[0].types,
                description: property.violations[0].short_desc,
                details: property.violations[0].details,
                currentSituation: property.violations[0].current_situation,
                resolutionDate: property.violations[0].resolution_date,
                complianceStatus: property.violations[0].compliance_status
            };
        }

        // Out of State - add flag to owner data
        if (motiveCode === 'OUT' && property.owners?.[0]) {
            data.owner.isOutOfState = property.owners[0].is_out_of_state || false;
        }

        res.json({ success: true, data });
        console.log(`[GET_PROPERTY] Response sent for ID: ${id}`);

    } catch (err) {
        console.error('GetProperty Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

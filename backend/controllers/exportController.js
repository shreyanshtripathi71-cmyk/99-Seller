const { SavedProperty, Property, ExportHistory, Loan, Owner } = require('../models');
const { Op } = require('sequelize');

// Export limits based on UserType
const EXPORT_LIMITS = {
    free: 5,
    premium: 100,
    enterprise: 1000,
    admin: 999999
};

// Helper to get current month usage
async function getUsage(username) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return await ExportHistory.count({
        where: {
            username,
            createdAt: {
                [Op.gte]: startOfMonth
            }
        }
    });
}

// Export saved leads
exports.exportSavedLeads = async (req, res) => {
    try {
        const username = req.user.Username;
        const userType = req.user.UserType || 'free';
        const { format = 'csv', type = 'saved', filters = {} } = req.body;

        // Check usage against limit
        const usage = await getUsage(username);
        const limit = EXPORT_LIMITS[userType.toLowerCase()] || EXPORT_LIMITS.free;

        if (usage >= limit && userType !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Monthly export limit reached. Upgrade your plan to export more leads.',
                usage,
                limit
            });
        }

        let exportData = [];

        if (type === 'saved') {
            // Get user's saved properties with full property details
            const savedProperties = await SavedProperty.findAll({
                where: { Username: username },
                include: [{
                    model: Property,
                    as: 'property',
                    include: [
                        { model: Loan, as: 'loans' },
                        { model: Owner, as: 'owners' }
                    ]
                }],
                order: [['createdAt', 'DESC']]
            });

            if (!savedProperties || savedProperties.length === 0) {
                return res.status(404).json({ success: false, error: 'No saved leads found' });
            }

            exportData = savedProperties.map(sp => {
                const prop = sp.property || {};
                const appraised = parseFloat(prop.PTotAppraisedAmt || 0);
                const totalDebt = (prop.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);

                return {
                    address: prop.PStreetAddr1 || 'N/A',
                    ownerName: prop.owners?.[0] ? `${prop.owners[0].OFirstName} ${prop.owners[0].OLastName}` : 'N/A',
                    ownerPhone: prop.owners?.[0]?.OCellPhone || 'N/A',
                    ownerEmail: prop.owners?.[0]?.OEmailAddr || 'N/A',
                    propertyType: prop.PPropertyType || 'N/A',
                    beds: prop.PBeds || 0,
                    baths: prop.PBaths || 0,
                    sqft: prop.PTotSQFootage || 0,
                    appraisedValue: appraised,
                    debt: totalDebt,
                    equity: appraised - totalDebt,
                    auctionDate: prop.PDateFiled || 'N/A'
                };
            });
        } else if (type === 'search') {
            // Filtered search export logic
            const { state, zip, motive, minEquity, maxDebt, minBeds, minBaths, minSqft, minYear, q } = filters;
            const whereClause = {};

            if (q) {
                whereClause[Op.or] = [
                    { PStreetAddr1: { [Op.like]: `%${q}%` } },
                    { Pcity: { [Op.like]: `%${q}%` } },
                    { Pzip: { [Op.like]: `%${q}%` } }
                ];
            }
            if (state && state !== 'All') whereClause.Pstate = state;
            if (zip) whereClause.Pzip = { [Op.like]: `%${zip}%` };
            if (minBeds && minBeds !== 'Any') whereClause.PBeds = { [Op.gte]: parseInt(minBeds) };
            if (minBaths && minBaths !== 'Any') whereClause.PBaths = { [Op.gte]: parseFloat(minBaths) };
            if (minSqft) whereClause.PTotSQFootage = { [Op.gte]: parseInt(minSqft) };
            if (minYear) whereClause.PYearBuilt = { [Op.gte]: parseInt(minYear) };

            const properties = await Property.findAll({
                where: whereClause,
                include: [
                    { model: Loan, as: 'loans' },
                    { model: Owner, as: 'owners' }
                ],
                limit: 1000 // Limit for safety
            });

            exportData = properties.map(prop => {
                const appraised = parseFloat(prop.PTotAppraisedAmt || 0);
                const totalDebt = (prop.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
                const equity = appraised - totalDebt;
                const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

                return {
                    address: prop.PStreetAddr1 || 'N/A',
                    ownerName: prop.owners?.[0] ? `${prop.owners[0].OFirstName} ${prop.owners[0].OLastName}` : 'N/A',
                    ownerPhone: prop.owners?.[0]?.OCellPhone || 'N/A',
                    ownerEmail: prop.owners?.[0]?.OEmailAddr || 'N/A',
                    propertyType: prop.PPropertyType || 'N/A',
                    beds: prop.PBeds || 0,
                    baths: prop.PBaths || 0,
                    sqft: prop.PTotSQFootage || 0,
                    appraisedValue: appraised,
                    debt: totalDebt,
                    equity: equity,
                    equityPercent: equityPercent,
                    auctionDate: prop.PDateFiled || 'N/A'
                };
            });

            // Post-fetch filters
            if (minEquity) exportData = exportData.filter(r => r.equityPercent >= parseInt(minEquity));
            if (maxDebt) exportData = exportData.filter(r => r.debt <= parseInt(maxDebt));
        }

        // Generate export based on format
        let content, mimeType, filename;
        const timestamp = Date.now();
        const userEmail = req.user.email || 'user@99sellers.com';

        if (format === 'csv') {
            content = generateCSV(exportData, userEmail);
            mimeType = 'text/csv;charset=utf-8';
            filename = `99sellers-leads-${timestamp}.csv`;
        } else if (format === 'json') {
            content = generateJSON(exportData, userEmail);
            mimeType = 'application/json;charset=utf-8';
            filename = `99sellers-leads-${timestamp}.json`;
        } else if (format === 'excel') {
            // For Excel, we'll use CSV with BOM
            content = generateCSV(exportData, userEmail);
            mimeType = 'text/csv;charset=utf-8';
            filename = `99sellers-leads-${timestamp}.xlsx.csv`;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid format. Use csv, json, or excel'
            });
        }

        // Log export for history
        try {
            await ExportHistory.create({
                username: req.user.Username,
                filename,
                recordCount: exportData.length,
                format,
                status: 'completed'
            });
        } catch (histError) {
            console.error('Failed to save export history:', histError);
        }

        res.json({
            success: true,
            data: {
                content,
                filename,
                mimeType,
                recordCount: exportData.length
            }
        });
    } catch (error) {
        console.error('Export saved leads error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export leads'
        });
    }
};

// Get export history
exports.getExportHistory = async (req, res) => {
    try {
        // req.user from auth middleware (contains Username)
        const username = req.user.Username;

        const history = await ExportHistory.findAll({
            where: { username },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Get export history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch export history'
        });
    }
};

// Helper function to generate CSV
function generateCSV(data, userEmail) {
    const timestamp = new Date().toISOString();

    // Watermark header
    let csv = `# 99Sellers Export - User: ${userEmail} - Generated: ${timestamp}\n`;
    csv += `# This data is licensed for personal use only. Redistribution is prohibited.\n`;
    csv += `# License ID: ${Buffer.from(userEmail + timestamp).toString('base64').slice(0, 16)}\n\n`;

    // CSV Header
    csv += 'Address,Owner Name,Phone,Email,Property Type,Beds,Baths,SqFt,Appraised Value,Debt,Equity,Auction Date\n';

    // Data rows
    data.forEach(row => {
        csv += `"${row.address}","${row.ownerName}","${row.ownerPhone}","${row.ownerEmail}","${row.propertyType}",${row.beds},${row.baths},${row.sqft},${row.appraisedValue},${row.debt},${row.equity},"${row.auctionDate}"\n`;
    });

    // Footer watermark
    csv += `\n# End of export - ${data.length} records - User: ${userEmail}`;

    return csv;
}

// Helper function to generate JSON
function generateJSON(data, userEmail) {
    const timestamp = new Date().toISOString();

    const exportData = {
        metadata: {
            exportedBy: userEmail,
            exportedAt: timestamp,
            licenseId: Buffer.from(userEmail + timestamp).toString('base64').slice(0, 16),
            recordCount: data.length,
            terms: 'This data is licensed for personal use only. Redistribution is prohibited.'
        },
        leads: data
    };

    return JSON.stringify(exportData, null, 2);
}
// Get export usage and limits
exports.getExportUsage = async (req, res) => {
    console.log('[DEBUG_EXPORT] getExportUsage called for:', req.user?.Username);
    try {
        const username = req.user.Username;
        const userType = req.user.UserType || 'free';

        const usage = await getUsage(username);
        const limit = EXPORT_LIMITS[userType.toLowerCase()] || EXPORT_LIMITS.free;

        res.json({
            success: true,
            data: {
                usage,
                limit,
                remaining: Math.max(0, limit - usage),
                userType,
                resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        });
    } catch (error) {
        console.error('Get export usage error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch export usage'
        });
    }
};

module.exports = exports;

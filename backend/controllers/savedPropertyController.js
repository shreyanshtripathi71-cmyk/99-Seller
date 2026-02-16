const { SavedProperty, Property, MotiveTypes, Proaddress, Owner, Loan, Auction, UserLogin } = require('../models');

exports.saveProperty = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const Username = req.user.Username; // req.user is a UserLogin instance

        if (!propertyId) {
            return res.status(400).json({ success: false, message: 'Property ID is required' });
        }

        const existing = await SavedProperty.findOne({ where: { Username, propertyId } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Property already saved' });
        }

        const saved = await SavedProperty.create({ Username, propertyId });
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        console.error('SaveProperty Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSavedProperties = async (req, res) => {
    try {
        const Username = req.user.Username;
        const saved = await SavedProperty.findAll({
            where: { Username },
            include: [{
                model: Property,
                as: 'property',
                include: [
                    { model: MotiveTypes, as: 'motiveType', attributes: ['name'] },
                    { model: Proaddress, as: 'proaddress', attributes: ['PStreetNum', 'PStreetName', 'Pcity', 'PState', 'Pzip', 'beds', 'baths', 'square_feet', 'price'] },
                    { model: Owner, as: 'owners', attributes: ['OFirstName', 'OLastName'] },
                    { model: Loan, as: 'loans', attributes: ['loan_amount'] },
                    { model: Auction, as: 'auctions', attributes: ['AAuctionDateTime'] }
                ]
            }],
            order: [['createdAt', 'DESC']]
        });

        // Format similarly to search results
        const formatted = saved.map(item => {
            const prop = item.property;
            if (!prop) return null;

            const appraised = parseFloat(prop.PTotAppraisedAmt || prop.proaddress?.price || 0);
            const totalDebt = (prop.loans || []).reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
            const equity = appraised - totalDebt;
            const equityPercent = appraised > 0 ? Math.round((equity / appraised) * 100) : 0;

            return {
                id: prop.id,
                savedId: item.id, // ID of the saved record
                image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400", // Placeholder
                type: prop.motiveType?.name || 'Unknown',
                address: prop.PStreetAddr1 || (prop.proaddress ? `${prop.proaddress.PStreetNum} ${prop.proaddress.PStreetName}` : 'Address Unknown'),
                city: prop.Pcity || prop.proaddress?.Pcity || '',
                state: prop.Pstate || prop.proaddress?.PState || '',
                zip: prop.Pzip || prop.proaddress?.Pzip || '',
                beds: parseInt(prop.PBeds || prop.proaddress?.beds || 0),
                baths: parseFloat(prop.PBaths || prop.proaddress?.baths || 0),
                appraised: appraised,
                debt: totalDebt,
                equity: equity,
                equityPercent: equityPercent,
                sqft: parseInt(prop.PTotSQFootage || prop.proaddress?.square_feet || 0),
                year: prop.PYearBuilt || 'N/A',
                auctionDate: prop.auctions?.[0]?.AAuctionDateTime ? new Date(prop.auctions[0].AAuctionDateTime).toLocaleDateString() : 'Pending',
                savedOn: item.createdAt,
                saved: true
            };
        }).filter(Boolean);

        res.json({ success: true, data: formatted });
    } catch (err) {
        console.error('GetSavedProperties Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.removeSavedProperty = async (req, res) => {
    try {
        const Username = req.user.Username;
        const { id } = req.params; // propertyId

        if (!id) {
            return res.status(400).json({ success: false, message: 'Property ID is required' });
        }

        const saved = await SavedProperty.findOne({ where: { Username, propertyId: id } });
        if (!saved) {
            return res.status(404).json({ success: false, message: 'Saved property not found' });
        }

        await saved.destroy();
        res.json({ success: true, message: 'Property removed from saved list' });
    } catch (err) {
        console.error('RemoveSavedProperty Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

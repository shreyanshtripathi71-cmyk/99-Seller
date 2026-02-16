const { SavedSearch } = require('../models');

const savedSearchController = {
    // Create a new saved search
    createSearch: async (req, res) => {
        try {
            const { name, filters } = req.body;
            const Username = req.user.Username; // From authMiddleware

            if (!name || !filters) {
                return res.status(400).json({ success: false, error: 'Name and filters are required' });
            }

            const newSearch = await SavedSearch.create({
                name,
                filters,
                Username
            });

            res.status(201).json({ success: true, data: newSearch });
        } catch (error) {
            console.error('Create saved search error:', error);
            res.status(500).json({ success: false, error: 'Failed to save search' });
        }
    },

    // Get all saved searches for the logged-in user
    getSearches: async (req, res) => {
        try {
            const Username = req.user.Username;

            const searches = await SavedSearch.findAll({
                where: { Username },
                order: [['createdAt', 'DESC']]
            });

            res.json({ success: true, data: searches });
        } catch (error) {
            console.error('Get saved searches error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch saved searches' });
        }
    },

    // Get a specific saved search
    getSearch: async (req, res) => {
        try {
            const { id } = req.params;
            const Username = req.user.Username;

            const search = await SavedSearch.findOne({ where: { id, Username } });

            if (!search) {
                return res.status(404).json({ success: false, error: 'Saved search not found' });
            }

            res.json({ success: true, data: search });
        } catch (error) {
            console.error('Get saved search error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch saved search' });
        }
    },

    // Delete a saved search
    deleteSearch: async (req, res) => {
        try {
            const { id } = req.params;
            const Username = req.user.Username;

            const search = await SavedSearch.findOne({ where: { id, Username } });

            if (!search) {
                return res.status(404).json({ success: false, error: 'Saved search not found' });
            }

            await search.destroy();

            res.json({ success: true, message: 'Saved search deleted' });
        } catch (error) {
            console.error('Delete saved search error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete saved search' });
        }
    }
};

module.exports = savedSearchController;

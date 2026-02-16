require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    const { Property } = require('./models');
    
    app.get('/api/properties', async (req, res) => {
      try {
        const properties = await Property.findAll({ limit: 10 });
        res.json({
          success: true,
          count: properties.length,
          data: properties.map(p => ({
            id: p.id,
            address: p.PStreetAddr1,
            city: p.Pcity,
            state: p.Pstate,
            zip: p.Pzip
          }))
        });
      } catch (err) {
        console.error('Error fetching properties:', err);
        res.status(500).json({ success: false, error: err.message });
      }
    });
    
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

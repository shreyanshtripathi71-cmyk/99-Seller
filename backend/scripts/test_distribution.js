const { Property, MotiveTypes, sequelize } = require('./models');

const testDistribution = async () => {
    try {
        console.log('Testing Property Distribution Query...');

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
            group: [sequelize.col('motiveType.name')],
            raw: true
        });

        console.log('Distribution Count:', propertiesByType.length);
        if (propertiesByType.length > 0) {
            console.log('First Item:', JSON.stringify(propertiesByType[0]));
        } else {
            console.log('No distribution data returned.');
        }

        // Also check if any properties have motive types assigned
        const countWithMotive = await Property.count({
            where: { motive_type_id: { [require('sequelize').Op.ne]: null } }
        });
        console.log('Properties with motive_type_id != null:', countWithMotive);

        const totalProps = await Property.count();
        console.log('Total Properties:', totalProps);

        process.exit(0);
    } catch (error) {
        console.error('Error running distribution query:', error);
        process.exit(1);
    }
};

testDistribution();

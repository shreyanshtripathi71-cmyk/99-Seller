module.exports = (sequelize, DataTypes) => {
    const SavedProperty = sequelize.define('SavedProperty', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'user_login',
                key: 'Username'
            }
        },
        propertyId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'saved_properties',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    SavedProperty.associate = (models) => {
        SavedProperty.belongsTo(models.UserLogin, { foreignKey: 'Username', targetKey: 'Username', as: 'user' });
        SavedProperty.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    };

    return SavedProperty;
};

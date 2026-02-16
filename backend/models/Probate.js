const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Probate = sequelize.define('Probate', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        property_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'property',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        case_number: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        probate_court: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        probate_court_county: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        filing_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        date_of_death: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        estate_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Testate, Intestate, etc.'
        },
        executor_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        executor_contact: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        estate_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Open, Closed, Pending, etc.'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'probate',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    Probate.associate = (models) => {
        Probate.belongsTo(models.Property, {
            foreignKey: 'property_id',
            as: 'property',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Probate;
};

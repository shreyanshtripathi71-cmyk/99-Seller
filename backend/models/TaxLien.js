const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TaxLien = sequelize.define('TaxLien', {
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
        tax_year: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Single year or range (e.g., "2023" or "2020-2023")'
        },
        amount_owed: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        last_tax_year_paid: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lien_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        tax_authority: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'County, City, State, etc.'
        },
        lien_number: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'Active, Paid, Pending Sale, etc.'
        },
        sale_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Tax sale date if scheduled'
        },
        redemption_period_end: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'tax_lien',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    TaxLien.associate = (models) => {
        TaxLien.belongsTo(models.Property, {
            foreignKey: 'property_id',
            as: 'property',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return TaxLien;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Divorce = sequelize.define('Divorce', {
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
            allowNull: false
        },
        court_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        filing_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        legal_filing_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        attorney_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        divorce_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Contested, Uncontested, etc.'
        },
        petitioner_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        respondent_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Filed, Pending, Final, etc.'
        },
        settlement_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'divorce',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    Divorce.associate = (models) => {
        Divorce.belongsTo(models.Property, {
            foreignKey: 'property_id',
            as: 'property',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Divorce;
};

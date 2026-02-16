const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Invoice = sequelize.define('Invoice', {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
            allowNull: false
        },
        Username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'user_login',
                key: 'Username'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'USD'
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: [['paid', 'pending', 'failed', 'refunded']]
            }
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        downloadUrl: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'invoices',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    // Define associations
    Invoice.associate = function (models) {
        Invoice.belongsTo(models.UserLogin, {
            foreignKey: 'Username',
            targetKey: 'Username',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Invoice;
};

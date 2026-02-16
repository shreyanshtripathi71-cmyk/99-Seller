const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PaymentMethod = sequelize.define('PaymentMethod', {
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
        type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: [['card', 'paypal', 'bank_transfer']]
            }
        },
        last4: {
            type: DataTypes.STRING(4),
            allowNull: true
        },
        brand: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        expiryMonth: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        expiryYear: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'For PayPal'
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        tableName: 'payment_methods',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    // Define associations
    PaymentMethod.associate = function (models) {
        PaymentMethod.belongsTo(models.UserLogin, {
            foreignKey: 'Username',
            targetKey: 'Username',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return PaymentMethod;
};

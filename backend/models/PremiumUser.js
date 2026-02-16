const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PremiumUser = sequelize.define('PremiumUser', {
    Username: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'user_login',
        key: 'Username'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'subscriptionId'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    subscriptionStart: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    subscriptionEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['paid', 'pending', 'failed']]
      }
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usageStats: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Track premium feature usage'
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
    tableName: 'premium_users',
    timestamps: true,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  // Define associations
  PremiumUser.associate = function (models) {
    PremiumUser.belongsTo(models.UserLogin, {
      foreignKey: 'Username',
      targetKey: 'Username',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    PremiumUser.belongsTo(models.Subscription, {
      foreignKey: 'subscriptionId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return PremiumUser;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    subscriptionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    planName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'premium',
      validate: {
        isIn: [['free', 'premium']]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'monthly, quarterly, yearly'
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: 'List of premium features'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'expired', 'cancelled']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    popular: {
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
    tableName: 'subscriptions',
    timestamps: true,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  // Define associations
  Subscription.associate = function (models) {
    Subscription.hasMany(models.PremiumUser, {
      foreignKey: 'subscriptionId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Subscription;
};

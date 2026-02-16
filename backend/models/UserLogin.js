const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserLogin = sequelize.define('UserLogin', {
    Username: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    FirstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Contact: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Address: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    City: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    State: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Pin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    UserType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['free', 'premium', 'admin']]
      }
    },
    ResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ResetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user_login',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  // Define associations
  UserLogin.associate = function (models) {
    UserLogin.hasOne(models.PremiumUser, {
      foreignKey: 'Username',
      sourceKey: 'Username',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    UserLogin.hasOne(models.FreeUser, {
      foreignKey: 'Username',
      sourceKey: 'Username',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    UserLogin.hasMany(models.SavedProperty, {
      foreignKey: 'Username',
      sourceKey: 'Username',
      as: 'savedProperties'
    });
  };

  return UserLogin;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Trustee = sequelize.define('Trustee', {
    TTrusteeID: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    TTrusteeName: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    TTrusteeAddress: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    TTRUSTEECity: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    TTRUSTEEState: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    TTRUSTEEZip: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TTrusteePhone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    TTrusteeEmail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    TTrusteeWebSite: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'trustee',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return Trustee;
};
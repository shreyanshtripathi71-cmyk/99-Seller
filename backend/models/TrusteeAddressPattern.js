const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TrusteeAddressPattern = sequelize.define('TrusteeAddressPattern', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    pattern_level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trustee_address_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'trustee_address_pattern',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return TrusteeAddressPattern;
};
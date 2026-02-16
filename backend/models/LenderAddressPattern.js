const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LenderAddressPattern = sequelize.define('LenderAddressPattern', {
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
    lender_address_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'lender_address_pattern',
    timestamps: false,
    engine: 'MyISAM',
    charset: 'latin1'
  });

  return LenderAddressPattern;
};
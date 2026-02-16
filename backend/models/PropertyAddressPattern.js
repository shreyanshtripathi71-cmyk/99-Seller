const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyAddressPattern = sequelize.define('PropertyAddressPattern', {
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
    property_address_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'property_address_pattern',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return PropertyAddressPattern;
};
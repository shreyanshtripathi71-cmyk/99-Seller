const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OwnerNamePattern = sequelize.define('OwnerNamePattern', {
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
    owner_name_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'owner_name_pattern',
    timestamps: false,
    engine: 'MyISAM',
    charset: 'latin1'
  });

  return OwnerNamePattern;
};
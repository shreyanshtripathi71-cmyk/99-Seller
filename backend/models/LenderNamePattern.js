const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LenderNamePattern = sequelize.define('LenderNamePattern', {
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
    lender_name_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'lender_name_pattern',
    timestamps: false,
    engine: 'MyISAM',
    charset: 'latin1'
  });

  return LenderNamePattern;
};
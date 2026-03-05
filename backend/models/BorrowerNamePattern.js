const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BorrowerNamePattern = sequelize.define('BorrowerNamePattern', {
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
    borrower_name_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'borrower_name_pattern',
    timestamps: false,
    engine: 'MyISAM',
    charset: 'latin1'
  });

  return BorrowerNamePattern;
};
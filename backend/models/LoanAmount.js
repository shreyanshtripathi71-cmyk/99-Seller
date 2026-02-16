const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LoanAmountPattern = sequelize.define('LoanAmountPattern', {
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
    loan_amount_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'loan_amount_pattern',
    timestamps: false,
    engine: 'MyISAM',
    charset: 'latin1'
  });

  return LoanAmountPattern;
};
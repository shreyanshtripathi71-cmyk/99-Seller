const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    property_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'property',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    deed_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrower_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lender_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lender_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loan_amount: {
      type: DataTypes.FLOAT(10, 2),
      allowNull: true
    },
    total_default_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    foreclosure_stage: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lis_pendens_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    arrears_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    default_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'loan',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Loan.associate = (models) => {
    Loan.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property'
    });
  };

  return Loan;
};
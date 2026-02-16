const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Violation = sequelize.define('Violation', {
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
    complaint: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    issue_date: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    types: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    short_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    remediation_deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    current_situation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Current status or situation of the violation'
    },
    resolution_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    compliance_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Compliant, Non-Compliant, In Progress, etc.'
    }
  }, {
    tableName: 'violation',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Violation.associate = (models) => {
    Violation.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Violation;
};
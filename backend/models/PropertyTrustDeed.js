const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyTrustDeed = sequelize.define('PropertyTrustDeed', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    deed_id: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    county: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    property_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    owner_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    borrower_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lender_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lender_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    trustee_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    trustee_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    property_id: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: ''
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loan_amount: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    local_document_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'property_trust_deed',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  PropertyTrustDeed.associate = (models) => {
    PropertyTrustDeed.hasMany(models.Proaddress, {
      foreignKey: 'property_trust_deed_id',
      as: 'proaddresses',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return PropertyTrustDeed;
};
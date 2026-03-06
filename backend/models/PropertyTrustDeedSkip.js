const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyTrustDeedSkip = sequelize.define('PropertyTrustDeedSkip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    trust_deed_doc: {
      type: DataTypes.STRING(70),
      allowNull: true
    },
    dttm: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'property_trust_deed_skip',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return PropertyTrustDeedSkip;
};
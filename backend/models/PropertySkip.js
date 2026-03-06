const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertySkip = sequelize.define('PropertySkip', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PStreetNum: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PStreetName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Pzip: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    skip: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    Pcity: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PState: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    counties: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'property_skip',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return PropertySkip;
};
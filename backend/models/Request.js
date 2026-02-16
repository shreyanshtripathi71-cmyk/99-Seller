const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    RS_Num: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    streetNum: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    streetName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    locDescription: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'request',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return Request;
};
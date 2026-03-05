const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ZipCitySt = sequelize.define('ZipCitySt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    county: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'zip_city_st',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8',
    rowFormat: 'COMPACT'
  });

  return ZipCitySt;
};
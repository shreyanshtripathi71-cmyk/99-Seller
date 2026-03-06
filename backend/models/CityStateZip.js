const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CityStateZip = sequelize.define('CityStateZip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'city_state_zip',
    timestamps: false,
    engine: 'MyISAM',
    charset: 'utf8'
  });

  return CityStateZip;
};
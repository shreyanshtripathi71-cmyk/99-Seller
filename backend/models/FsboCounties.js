const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FsboCounties = sequelize.define('FsboCounties', {
    county: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
      defaultValue: '0'
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'fsbo_counties',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return FsboCounties;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cache = sequelize.define('Cache', {
    key: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    }
  }, {
    tableName: 'cache',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return Cache;
};
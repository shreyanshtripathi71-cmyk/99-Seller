const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const History = sequelize.define('History', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    page: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    ad_number: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    crawler_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'history',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return History;
};
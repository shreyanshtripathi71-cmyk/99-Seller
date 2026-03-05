const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proxy = sequelize.define('Proxy', {
    proxy_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    proxy_site_provider: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    proxy_site_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    proxy_site_port: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    encryption_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    path_to_password: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'proxy',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return Proxy;
};

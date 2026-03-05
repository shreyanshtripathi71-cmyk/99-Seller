const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CrawlerConfig = sequelize.define('CrawlerConfig', {
    site_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'site',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    crawler_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    proxy_yn: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    time_delay_yn: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    threads_yn: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    rotate_proxies_yn: {
      type: DataTypes.CHAR(1),
      allowNull: true
    }
  }, {
    tableName: 'crawler_config',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  CrawlerConfig.associate = (models) => {
    CrawlerConfig.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site'
    });
  };

  return CrawlerConfig;
};
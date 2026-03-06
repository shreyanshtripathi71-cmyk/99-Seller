const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CrawledCounties = sequelize.define('CrawledCounties', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      defaultValue: 0
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    site_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'site',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    county_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'county',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'crawled_counties',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  CrawledCounties.associate = (models) => {
    CrawledCounties.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site'
    });
    CrawledCounties.belongsTo(models.County, {
      foreignKey: 'county_id',
      as: 'county'
    });
  };

  return CrawledCounties;
};
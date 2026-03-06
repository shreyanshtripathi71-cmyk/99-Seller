const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const County = sequelize.define('County', {
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
    index: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    use: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    address_template: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    num_fields: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'county',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  County.associate = (models) => {
    County.hasMany(models.FilesUrls, {
      foreignKey: 'county_id',
      as: 'filesUrls',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    County.hasMany(models.CityCounty, {
      foreignKey: 'county_id',
      as: 'cityCounties',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    County.hasMany(models.CountyCityZip, {
      foreignKey: 'county_id',
      as: 'countyCityZips',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    County.hasMany(models.CrawledCounties, {
      foreignKey: 'county_id',
      as: 'crawledCounties',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return County;
};
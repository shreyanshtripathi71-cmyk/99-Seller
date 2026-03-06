const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CrawlerLogAll = sequelize.define('CrawlerLogAll', {
    crawler_log_all_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    site_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'site',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    county: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    zipcode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    firstname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    middlename: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    streetnum: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    streetname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    addressline2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    data_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    text_dump: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    failed_yn: {
      type: DataTypes.CHAR(1),
      allowNull: true
    }
  }, {
    tableName: 'crawler_log_all',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  CrawlerLogAll.associate = (models) => {
    CrawlerLogAll.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site'
    });
  };

  return CrawlerLogAll;
};

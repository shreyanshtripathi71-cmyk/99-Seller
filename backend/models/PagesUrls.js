const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PagesUrls = sequelize.define('PagesUrls', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    use: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    page: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    county_id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    motive_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'motive_types',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'pages_urls',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  PagesUrls.associate = (models) => {
    PagesUrls.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site'
    });
    PagesUrls.belongsTo(models.MotiveTypes, {
      foreignKey: 'motive_type_id',
      as: 'motiveType'
    });
  };

  return PagesUrls;
};
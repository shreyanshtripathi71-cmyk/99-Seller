const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Site = sequelize.define('Site', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'sites_groups',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    owner_format: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    property_format: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tables_to_use: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_run: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.MEDIUMINT.UNSIGNED,
      allowNull: true
    },
    crawler_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'site',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Site.associate = (models) => {
    Site.hasMany(models.Proaddress, {
      foreignKey: 'site_id',
      as: 'proaddresses',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Site.hasMany(models.Errors, {
      foreignKey: 'site_id',
      as: 'errors',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Site;
};
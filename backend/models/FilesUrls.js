const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FilesUrls = sequelize.define('FilesUrls', {
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
    contents: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    property_card: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parsed: {
      type: DataTypes.INTEGER,
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
    },
    html_md5: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    proaddress_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'proaddress',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    ownername_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'ownername',
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
    },
    PMotiveType: {
      type: DataTypes.CHAR(3),
      allowNull: true
    }
  }, {
    tableName: 'files_urls',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  FilesUrls.associate = (models) => {
    FilesUrls.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    FilesUrls.belongsTo(models.County, {
      foreignKey: 'county_id',
      as: 'county',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    FilesUrls.belongsTo(models.Proaddress, {
      foreignKey: 'proaddress_id',
      as: 'proaddress',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    FilesUrls.belongsTo(models.Ownername, {
      foreignKey: 'ownername_id',
      as: 'ownername',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    FilesUrls.belongsTo(models.MotiveTypes, {
      foreignKey: 'motive_type_id',
      as: 'motiveType',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    FilesUrls.hasMany(models.Property, {
      foreignKey: 'PFilesUrlsId',
      as: 'properties',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return FilesUrls;
};
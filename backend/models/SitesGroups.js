const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SitesGroups = sequelize.define('SitesGroups', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  }, {
    tableName: 'sites_groups',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  SitesGroups.associate = (models) => {
    SitesGroups.hasMany(models.Site, {
      foreignKey: 'group_id',
      as: 'sites',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return SitesGroups;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RestartRow = sequelize.define('RestartRow', {
    restart_row_id: {
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
    data_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'restart_row',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  RestartRow.associate = (models) => {
    RestartRow.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return RestartRow;
};
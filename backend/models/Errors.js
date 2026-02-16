const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Errors = sequelize.define('Errors', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
    date_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    text: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'errors',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Errors.associate = (models) => {
    Errors.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site'
    });
  };

  return Errors;
};
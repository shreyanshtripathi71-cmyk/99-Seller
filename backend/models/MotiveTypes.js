const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MotiveTypes = sequelize.define('MotiveTypes', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'motive_types',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  MotiveTypes.associate = (models) => {
    MotiveTypes.hasMany(models.Property, {
      foreignKey: 'motive_type_id',
      as: 'properties',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return MotiveTypes;
};
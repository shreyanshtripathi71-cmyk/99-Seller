const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CountyCityZip = sequelize.define('CountyCityZip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    county_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'county',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'county_city_zip',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  CountyCityZip.associate = (models) => {
    CountyCityZip.belongsTo(models.County, {
      foreignKey: 'county_id',
      as: 'county'
    });
  };

  return CountyCityZip;
};
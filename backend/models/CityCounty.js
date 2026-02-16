const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CityCounty = sequelize.define('CityCounty', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    }
  }, {
    tableName: 'city_county',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  CityCounty.associate = (models) => {
    CityCounty.belongsTo(models.County, {
      foreignKey: 'county_id',
      as: 'county'
    });
  };

  return CityCounty;
};
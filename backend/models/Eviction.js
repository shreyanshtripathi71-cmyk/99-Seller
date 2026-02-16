const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Eviction = sequelize.define('Eviction', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    property_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'property',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    court_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    court_docket: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    plaintiff_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    court_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    court_room: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'eviction',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Eviction.associate = (models) => {
    Eviction.belongsTo(models.Property, {
      foreignKey: 'property_id',
      as: 'property'
    });
  };

  return Eviction;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Owner = sequelize.define('Owner', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    OLastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    OMiddleName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    OFirstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    OStreetAddr1: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    OStreetAddr2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    OCity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    OState: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    OZip: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    OProperty_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'property',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    insert_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    is_out_of_state: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if owner resides out of state'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'owner',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Owner.associate = (models) => {
    Owner.belongsTo(models.Property, {
      foreignKey: 'OProperty_id',
      as: 'property'
    });
  };

  return Owner;
};
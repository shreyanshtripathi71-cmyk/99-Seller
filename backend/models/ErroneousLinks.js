const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ErroneousLinks = sequelize.define('ErroneousLinks', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
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
      }
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'erroneous_links',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  ErroneousLinks.associate = (models) => {
    ErroneousLinks.belongsTo(models.Proaddress, {
      foreignKey: 'proaddress_id',
      as: 'proaddress'
    });
    ErroneousLinks.belongsTo(models.Ownername, {
      foreignKey: 'ownername_id',
      as: 'ownername'
    });
  };

  return ErroneousLinks;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auctioneer = sequelize.define('Auctioneer', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    web_site: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '0 - trustee, 1 - auctioneer'
    }
  }, {
    tableName: 'auctioneer',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Auctioneer.associate = (models) => {
    Auctioneer.hasMany(models.Property, {
      foreignKey: 'auctioneer_id',
      as: 'properties',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Auctioneer.hasMany(models.Proaddress, {
      foreignKey: 'auctioneer_id',
      as: 'proaddresses',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Auctioneer;
};
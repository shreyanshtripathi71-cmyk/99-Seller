const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auction = sequelize.define('Auction', {
    AAuctionID: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    AAuctionDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    AAuctionPlace: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    AAuctionPlaceAddr1: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    AAuctionPlaceAddr2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    AAuctionCity: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    AAuctionState: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    AAuctionZip: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    minimum_bid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    AAuctionDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    APropertyID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'property',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    tableName: 'auction',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Auction.associate = (models) => {
    Auction.belongsTo(models.Property, {
      foreignKey: 'APropertyID',
      as: 'property'
    });
  };

  return Auction;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Property = sequelize.define('Property', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    PStreetAddr1: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PStreetAddr2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Pcity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Pstate: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    Pzip: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Pcounty: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PBase: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    PBeds: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    PBaths: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    PLandBuilding: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PLastSoldAmt: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PLastSoldDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    PTotLandArea: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PTotBuildingArea: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PTotSQFootage: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PYearBuilt: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    PAppraisedBuildingAmt: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PAppraisedLandAmt: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    PTotAppraisedAmt: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    motive_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'motive_types',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    auctioneer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'auctioneer',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
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
    PFilesUrlsId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'files_urls',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    PAuctioneerID: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    PComments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PDateFiled: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PListingID: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    local_image_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'property',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Property.associate = (models) => {
    Property.belongsTo(models.MotiveTypes, {
      foreignKey: 'motive_type_id',
      as: 'motiveType',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.belongsTo(models.Auctioneer, {
      foreignKey: 'auctioneer_id',
      as: 'auctioneer',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.belongsTo(models.Proaddress, {
      foreignKey: 'proaddress_id',
      as: 'proaddress',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Auction, {
      foreignKey: 'APropertyID',
      as: 'auctions',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Owner, {
      foreignKey: 'OProperty_id',
      as: 'owners',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Eviction, {
      foreignKey: 'property_id',
      as: 'evictions',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Loan, {
      foreignKey: 'property_id',
      as: 'loans',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Violation, {
      foreignKey: 'property_id',
      as: 'violations',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Probate, {
      foreignKey: 'property_id',
      as: 'probates',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.Divorce, {
      foreignKey: 'property_id',
      as: 'divorces',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Property.hasMany(models.TaxLien, {
      foreignKey: 'property_id',
      as: 'taxLiens',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Property;
};
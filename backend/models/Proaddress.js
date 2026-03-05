const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proaddress = sequelize.define('Proaddress', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    listing_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PStreetNum: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    backup_street_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PStreetName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    PSuiteNum: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Pcity: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    PState: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    Pzip: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    word: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    abbreviation: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    owner_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    PMotiveType: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    counties: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    price: {
      type: DataTypes.DOUBLE(20, 4).UNSIGNED,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    beds: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    baths: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    owner_mailing_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    owner_current_state: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    proptype: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    square_feet: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    PYearBuilt: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    floors: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: true
    },
    school_district: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    garage_size: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: true
    },
    lot_size: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    amenities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    owner_phone: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    DATE_TIMEOFEXTRACTION: {
      type: DataTypes.DATE,
      allowNull: true
    },
    parsed: {
      type: DataTypes.ENUM('2 exact matches', 'success', 'address not found'),
      allowNull: true
    },
    auctioneer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
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
    sale_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    page_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    county_fixed: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    case_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    deed_book_page: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ownername_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'ownername',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    property_trust_deed_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'property_trust_deed',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    trusteename: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    trusteecompanyname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    trusteeaddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    trusteecity: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    trusteestate: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    trusteezip: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trusteephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    trusteeemail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trusteewebsite: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trusteetype: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    auction_amt: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    auctiondatetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    auctionplace: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    auctionplaceaddr1: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    auctionplaceaddr2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    auctioncity: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    auctionstate: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    auctionzip: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    auctiondescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    auctioneername: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    auctioneercompanyname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    auctioneeraddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    auctioneerphone: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    auctioneeremail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    auctioneerweb_site: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    auctioneerhtml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    court_docket: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    court_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    street_name_post_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sale_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    skip_row: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    violation_complaint: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    violation_issue_date: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    violation_types: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    violation_total: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    violation_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    violation_details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eviction_owner_lawyer_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    streetnameposttype: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    violation_issued_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PLastName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PMiddleName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PFirstName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PcompayName: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'proaddress',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Proaddress.associate = (models) => {
    Proaddress.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Proaddress.belongsTo(models.Auctioneer, {
      foreignKey: 'auctioneer_id',
      as: 'auctioneerRef',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Proaddress.belongsTo(models.PropertyTrustDeed, {
      foreignKey: 'property_trust_deed_id',
      as: 'propertyTrustDeed',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Proaddress.hasMany(models.Property, {
      foreignKey: 'proaddress_id',
      as: 'properties',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Proaddress;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ownername = sequelize.define('Ownername', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    PLastName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    PMiddleName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PFirstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PcompanyName: {
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
    html: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'ownername',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  Ownername.associate = (models) => {
    Ownername.hasMany(models.FilesUrls, {
      foreignKey: 'ownername_id',
      as: 'filesUrls',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Ownername.hasMany(models.Proaddress, {
      foreignKey: 'ownername_id',
      as: 'proaddresses',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Ownername.hasMany(models.ErroneousLinks, {
      foreignKey: 'ownername_id',
      as: 'erroneousLinks',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Ownername;
};
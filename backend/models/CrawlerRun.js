const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CrawlerRun = sequelize.define('CrawlerRun', {
    CrawlerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    Stage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CrawlerFile: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    LogFile: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CrawlerName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CrDataType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    LastRunStart: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    LastRunEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    RunStatus: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Proxy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RotateProxy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    TimeDelay: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Enable: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RunDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'crawler_run',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return CrawlerRun;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeDelay = sequelize.define('TimeDelay', {
    site_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'site',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    delay_min_secs: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    delay_max_secs: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'time_delay',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  TimeDelay.associate = (models) => {
    TimeDelay.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return TimeDelay;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RunDates = sequelize.define('RunDates', {
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
    min_run_dt: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    max_run_dt: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'run_dates',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  RunDates.associate = (models) => {
    RunDates.belongsTo(models.Site, {
      foreignKey: 'site_id',
      as: 'site',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return RunDates;
};
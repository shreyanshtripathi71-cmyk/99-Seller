const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AdminActivity = sequelize.define('AdminActivity', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('user', 'subscription', 'property', 'login', 'system', 'crawler'),
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        tableName: 'admin_activities',
        timestamps: true,
        updatedAt: false, // Activities are immutable logs
        engine: 'InnoDB',
        charset: 'utf8'
    });

    return AdminActivity;
};

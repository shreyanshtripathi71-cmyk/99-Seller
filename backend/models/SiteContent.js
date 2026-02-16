const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SiteContent = sequelize.define('SiteContent', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.JSON,
            allowNull: true
        },
        contentType: {
            type: DataTypes.ENUM('text', 'json', 'image'),
            allowNull: false,
            defaultValue: 'json'
        }
    }, {
        tableName: 'site_contents',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    return SiteContent;
};

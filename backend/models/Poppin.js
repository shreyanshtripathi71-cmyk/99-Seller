const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Poppin = sequelize.define('Poppin', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('banner', 'modal', 'toast', 'slide-in', 'fullscreen', 'floating-bar', 'email-capture', 'social-proof', 'countdown', 'sidebar'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        buttonText: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        buttonLink: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        secondaryButtonText: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        secondaryButtonLink: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        backgroundColor: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '#3b82f6'
        },
        textColor: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '#ffffff'
        },
        accentColor: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        position: {
            type: DataTypes.ENUM('top', 'bottom', 'center', 'bottom-right', 'bottom-left', 'left', 'right'),
            allowNull: false,
            defaultValue: 'center'
        },
        trigger: {
            type: DataTypes.ENUM('page-load', 'scroll', 'exit-intent', 'time-delay', 'click'),
            allowNull: false,
            defaultValue: 'page-load'
        },
        triggerValue: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        pages: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of page paths'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        showOnMobile: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        showOnDesktop: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        dismissable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        showOnce: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        emailPlaceholder: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        successMessage: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        countdownEnd: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'poppins',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    return Poppin;
};

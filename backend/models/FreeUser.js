const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FreeUser = sequelize.define('FreeUser', {
        Username: {
            type: DataTypes.STRING(50),
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'user_login',
                key: 'Username'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'free_users',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    // Define associations
    FreeUser.associate = function (models) {
        FreeUser.belongsTo(models.UserLogin, {
            foreignKey: 'Username',
            targetKey: 'Username',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return FreeUser;
};

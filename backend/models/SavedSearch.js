module.exports = (sequelize, DataTypes) => {
    const SavedSearch = sequelize.define('SavedSearch', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        filters: {
            type: DataTypes.JSON,
            allowNull: false
        },
        Username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'user_login',
                key: 'Username'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, {
        tableName: 'saved_searches',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    SavedSearch.associate = (models) => {
        SavedSearch.belongsTo(models.UserLogin, {
            foreignKey: 'Username',
            targetKey: 'Username',
            as: 'user'
        });
    };

    return SavedSearch;
};

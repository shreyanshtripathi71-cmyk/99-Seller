module.exports = (sequelize, DataTypes) => {
    const ExportHistory = sequelize.define("ExportHistory", {
        exportId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        recordCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        format: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'completed',
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'exporthistory',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    ExportHistory.associate = (models) => {
        ExportHistory.belongsTo(models.UserLogin, { foreignKey: 'username', targetKey: 'Username', as: 'user' });
    };

    return ExportHistory;
};

module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('Feedback', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        Username: {
            type: DataTypes.STRING(50),
            allowNull: true,
            references: {
                model: 'user_login',
                key: 'Username'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'general',
            validate: {
                isIn: [['general', 'bug', 'feature', 'billing', 'other']]
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            }
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'new',
            validate: {
                isIn: [['new', 'read', 'in_progress', 'resolved', 'archived']]
            }
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true
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
        tableName: 'feedbacks',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    Feedback.associate = function (models) {
        Feedback.belongsTo(models.UserLogin, {
            foreignKey: 'Username',
            targetKey: 'Username',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    };

    return Feedback;
};

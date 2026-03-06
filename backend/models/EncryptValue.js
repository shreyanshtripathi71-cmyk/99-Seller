const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EncryptValue = sequelize.define('EncryptValue', {
    encryptvalue_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    enc_table_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    enc_table_row_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    enc_column_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    encrypted_val: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'encryptvalue',
    timestamps: false,
    engine: 'InnoDB',
    charset: 'utf8'
  });

  return EncryptValue;
};
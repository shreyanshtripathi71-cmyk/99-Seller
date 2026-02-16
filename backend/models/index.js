const { Sequelize, Transaction } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Database configuration
// Database configuration
// Enhanced Database configuration for Railway/Production compatibility
let sequelize;

// Detect Railway variables
const rHost = process.env.MYSQLHOST;
const rPort = process.env.MYSQLPORT;
const rUser = process.env.MYSQLUSER;
const rPass = process.env.MYSQLPASSWORD;
const rDb = process.env.MYSQLDATABASE;
const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

console.log('[DB_DEBUG] Railway/Env Detection:');
console.log('[DB_DEBUG] MYSQLHOST:', rHost ? 'PRESENT' : 'MISSING');
console.log('[DB_DEBUG] MYSQL_URL:', mysqlUrl ? 'PRESENT' : 'MISSING');
console.log('[DB_DEBUG] NODE_ENV:', process.env.NODE_ENV);

// Logic: Prefer individual variables on Railway for more stability, fallback to URL
if (rHost && rUser && rDb) {
  console.log(`[DB_INIT] Using individual Railway variables (Host: ${rHost.split('.')[0]}...)`);

  sequelize = new Sequelize(rDb, rUser, rPass, {
    host: rHost,
    port: rPort || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // Internal Railway connections usually don't need/want SSL
      ssl: rHost.includes('railway.internal') ? false : {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: { 
      max: 15, 
      min: 2, 
      acquire: 30000, 
      idle: 10000,
      evict: 1000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    retry: {
      max: 3,
      timeout: 5000
    }
  });
} else if (mysqlUrl) {
  console.log('[DB_INIT] Using URL-based connection string');
  sequelize = new Sequelize(mysqlUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: mysqlUrl.includes('railway.internal') ? false : {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: { 
      max: 15, 
      min: 2, 
      acquire: 30000, 
      idle: 10000,
      evict: 1000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    retry: {
      max: 3,
      timeout: 5000
    }
  });
} else {
  console.log('[DB_INIT] Falling back to standard config (likely local)');
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: { 
      max: 15, 
      min: 2, 
      acquire: 30000, 
      idle: 10000,
      evict: 1000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    retry: {
      max: 3,
      timeout: 5000
    }
  });
}

const db = {};

// Read all model files from current directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
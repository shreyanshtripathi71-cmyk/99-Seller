# Backend Directory Structure

```
backend/
├── config/                 # Configuration files
│   └── config.js           # Database and environment configuration
├── controllers/            # Route controllers
├── middleware/             # Express middleware
├── models/                 # Database models (Sequelize)
├── routes/                 # API route definitions
├── services/               # Business logic services
├── utils/                  # Utility scripts organized by category
│   ├── database/          # Database maintenance scripts
│   ├── migration/         # Database migration scripts
│   ├── seed/              # Data seeding scripts
│   └── test/              # Testing and verification scripts
├── scripts/               # Automation and deployment scripts
├── logs/                  # Application logs
├── temp/                  # Temporary files and outputs
├── docs/                  # Documentation
├── tests/                 # Unit and integration tests
├── uploads/               # File upload storage
├── migrations/            # SQL migration files
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── index.js              # Application entry point
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Key Improvements Made:
1. **Organized utility scripts** by function into subdirectories
2. **Separated concerns** with dedicated folders for different purposes
3. **Removed clutter** by moving logs and temporary files to appropriate locations
4. **Professional structure** following Node.js best practices
5. **Clear separation** between application code and utility scripts

## Usage:
- Main application: `index.js`
- Database operations: `utils/database/`
- Migrations: `utils/migration/` and `migrations/`
- Testing: `utils/test/` and `tests/`
- Logs: `logs/`
- Temporary files: `temp/`

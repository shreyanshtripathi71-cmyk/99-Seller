# 99Sellers Backend API

A professional Node.js/Express backend for the 99Sellers platform with MySQL database integration.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
# Edit .env with your database credentials

# Start the server
npm start

# For development with auto-reload
npm run dev
```

## Environment Variables

Required environment variables:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=99sellers

# Railway Database (for production)
MYSQLHOST=mysql.railway.internal
MYSQLUSER=root
MYSQLPASSWORD=your_railway_password
MYSQLDATABASE=railway
MYSQLPORT=3306

# Application
NODE_ENV=development
PORT=3000
```

## Database Setup

### Local Development
```bash
# Create database and run schema
mysql -u root -p -e "CREATE DATABASE 99sellers"
npm run setup-db
```

### Railway Production
Database is automatically configured via Railway environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/properties` - Get user's saved properties

## Database Utilities

### Database Maintenance
```bash
# Run database cleanup
node utils/database/cleanup-database.js

# Check database indexes
node utils/database/check_indexes.js

# Debug database connection
node utils/database/debug_db.js
```

### Data Migration
```bash
# Migrate data to Railway
node utils/migration/migrate_data_to_railway.js

# Import SQL dump
node utils/migration/import_to_railway.js
```

### Data Seeding
```bash
# Seed sample properties
node utils/seed/seed-properties.js

# Seed motive types
node utils/seed/seed-motive-types.js
```

## Project Structure

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for detailed directory structure.

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **MySQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **cors** - Cross-origin resource sharing

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

ISC

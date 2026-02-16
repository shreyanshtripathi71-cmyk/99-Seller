# Production Server Setup Guide

## 🚀 Dedicated Server Deployment

### Environment Detection
The application automatically detects the deployment environment:

- **Cloud (Railway/Vercel)**: Uses memory-based rate limiting with conservative limits
- **Dedicated Server**: Uses Redis-based distributed rate limiting with higher limits

### Rate Limiting Comparison

| Feature | Cloud (Railway/Vercel) | Dedicated Server |
|---------|----------------------|------------------|
| **General API** | 500 req/15min | 1000 req/15min |
| **Login Attempts** | 15 req/15min | 20 req/15min |
| **Admin Operations** | 200 req/15min | 500 req/15min |
| **File Uploads** | 15 req/15min | 50 req/hour |
| **Property Requests** | 500 req/15min | 200 req/15min |
| **User Registration** | 15 req/15min | 5 req/hour |
| **Storage** | Memory | Redis (distributed) |
| **Scalability** | Single instance | Multi-instance |

### Setup Instructions

#### 1. Install Dependencies
```bash
npm install --production
```

#### 2. Configure Environment Variables
Copy `.env.production` to `.env` and update with your server details:
```bash
cp .env.production .env
# Edit .env with your server configuration
```

#### 3. Setup Redis (Optional but recommended)
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# CentOS/RHEL
sudo yum install redis

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### 4. Setup Database
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE 99sellers"

# Import schema
mysql -u root -p 99sellers < migrations/database_schema.sql
```

#### 5. Setup Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name "99sellers-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 6. Setup Nginx (Optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### Performance Optimization

#### Database Connection Pool
- **Cloud**: 15 connections max
- **Dedicated**: 50 connections max (configurable via `DB_POOL_MAX`)

#### Caching Strategy
- **Redis**: Distributed rate limiting and session storage
- **Memory**: Application-level caching for frequent queries

#### Load Balancing
With Redis rate limiting, you can run multiple instances behind a load balancer.

### Monitoring & Scaling

#### Health Checks
- `/health` endpoint for load balancer health checks
- Automatic failover with Redis distributed rate limiting

#### Metrics
- Enable metrics with `ENABLE_METRICS=true`
- Monitor on port 9090

#### Scaling Strategy
1. **Horizontal**: Add more app instances
2. **Vertical**: Increase server resources
3. **Database**: Add read replicas for heavy read workloads

### Security Considerations

#### Rate Limiting
- IP-based rate limiting prevents abuse
- Different limits for different endpoint types
- Automatic Redis fallback to memory store

#### DDoS Protection
- Configurable rate limits per endpoint
- Request queuing and timeout handling
- Health check bypass for monitoring systems

### Troubleshooting

#### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis.log
```

#### Rate Limiting Issues
- Check Redis connectivity
- Verify environment variables
- Monitor memory usage for fallback to memory store

#### Performance Issues
- Monitor database connection pool usage
- Check Redis memory usage
- Review application logs for bottlenecks

### Expected Capacity

#### Dedicated Server with Redis
- **Concurrent Users**: 500-1000+
- **Requests/Second**: 50-100+
- **Peak Load**: 2000+ requests/minute
- **Sustained Load**: 1000+ requests/minute

#### Scaling Factors
- **CPU**: 2+ cores recommended
- **Memory**: 4GB+ RAM recommended
- **Database**: Connection pooling crucial
- **Redis**: Essential for distributed rate limiting

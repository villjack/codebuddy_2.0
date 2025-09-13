# 🚀 CodeBuddy - Developer Community Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://djangoproject.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A modern, Discord-like developer community platform built with Django, featuring real-time chat, room management, owner privileges, and comprehensive admin tools.**

![CodeBuddy Platform](https://via.placeholder.com/800x400/0d1117/58a6ff?text=CodeBuddy+Platform)

## ✨ Features

### 🔐 **Authentication System**
- ✅ **Email verification** with activation links
- ✅ **Two-factor authentication** (TOTP + backup codes)  
- ✅ **Social login** (GitHub, Google, Discord)
- ✅ **Password strength** requirements
- ✅ **Dark mode interface** with smooth animations

### 🏠 **Room System**
- ✅ **Discord-like interface** with sidebar navigation
- ✅ **Room categories**: Programming Languages, Web Development, Career, Community
- ✅ **Subrooms** with detailed descriptions and info panels
- ✅ **Improved subroom visibility** - inherit parent room colors
- ✅ **Real-time chat** with WebSocket connections
- ✅ **File upload system** with drag-and-drop support

### 👑 **Owner Privileges**
- ✅ **Golden crown badges** and owner identification
- ✅ **Owner control panel** with admin actions
- ✅ **Platform analytics** with real-time metrics
- ✅ **User management** tools (ban, mute, warn)
- ✅ **Broadcast messaging** to all users
- ✅ **Special message highlighting**

### 🤖 **Advanced Features**
- ✅ **Bot integration** with interactive commands
- ✅ **Voice/Video calls** with WebRTC
- ✅ **Screen sharing** capabilities  
- ✅ **Code syntax highlighting** (5+ languages)
- ✅ **Markdown support** with @mentions/#hashtags
- ✅ **Comprehensive REST API**
- ✅ **Analytics dashboard**
- ✅ **Mobile responsive** design

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend assets)
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (recommended)

### 🐳 Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/your-username/codebuddy.git
cd codebuddy
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**
```bash
# Development environment
docker-compose up -d

# Production environment  
docker-compose -f docker-compose.prod.yml up -d
```

4. **Access the application**
- Main app: http://localhost:8000
- Admin: http://localhost:8000/admin
- API docs: http://localhost:8000/api/

### 🛠 Manual Setup

1. **Clone and setup virtual environment**
```bash
git clone https://github.com/your-username/codebuddy.git
cd codebuddy

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup database**
```bash
# Create PostgreSQL database
createdb codebuddy_dev

# Run migrations
python manage.py migrate

# Create superuser (owner account)
python manage.py createsuperuser
```

4. **Setup Redis**
```bash
# Start Redis server
redis-server
```

5. **Run the development server**
```bash
# Start Django development server
python manage.py runserver

# In another terminal, start Celery worker
celery -A codebuddy worker -l info
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/codebuddy_dev

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@codebuddy.dev

# Social Authentication
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 (Optional - for file storage)
USE_S3=False
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket
AWS_S3_REGION_NAME=us-east-1

# Security (Production)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
```

### Social Authentication Setup

#### GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:8000/accounts/github/login/callback/`
4. Add CLIENT_ID and CLIENT_SECRET to `.env`

#### Google OAuth App  
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/accounts/google/login/callback/`
6. Add CLIENT_ID and CLIENT_SECRET to `.env`

## 🏗 Project Structure

```
codebuddy/
├── codebuddy/                  # Main Django project
│   ├── settings/              # Environment-specific settings
│   │   ├── base.py           # Base configuration  
│   │   ├── development.py    # Development settings
│   │   └── production.py     # Production settings
│   ├── urls.py               # URL routing
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application (WebSocket)
├── apps/                     # Django applications
│   ├── authentication/      # User management & auth
│   ├── rooms/               # Room & chat system
│   ├── analytics/           # Analytics & dashboard
│   └── bot/                # Bot integration
├── static/                  # Static assets (CSS, JS, images)
│   ├── css/                # Stylesheets  
│   ├── js/                 # JavaScript files
│   └── images/             # Images & icons
├── templates/              # HTML templates
├── media/                  # User uploaded files
├── requirements/           # Python dependencies
├── scripts/               # Deployment & utility scripts
├── tests/                 # Test suite
├── docs/                  # Documentation
├── nginx/                 # Nginx configuration
├── .github/               # GitHub Actions workflows
├── docker-compose.yml     # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── Dockerfile            # Docker container definition
└── README.md            # This file
```

## 🚀 Deployment

### Production Docker Deployment

1. **Prepare production environment**
```bash
# Clone repository
git clone https://github.com/your-username/codebuddy.git
cd codebuddy

# Create production environment file
cp .env.example .env.prod
# Configure production values
```

2. **Deploy with Docker Compose**
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec web python manage.py migrate

# Collect static files  
docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput

# Create superuser
docker-compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```

3. **Setup SSL Certificate**
```bash
# Generate SSL certificate (Let's Encrypt)
certbot --nginx -d your-domain.com

# Or place your SSL certificates in nginx/ssl/
```

### AWS ECS Deployment

1. **Build and push Docker image**
```bash
# Build image
docker build -t codebuddy:latest .

# Tag for ECR
docker tag codebuddy:latest your-account.dkr.ecr.region.amazonaws.com/codebuddy:latest

# Push to ECR
docker push your-account.dkr.ecr.region.amazonaws.com/codebuddy:latest
```

2. **Create ECS Service**
- Use the provided `ecs-task-definition.json`
- Configure environment variables in AWS Secrets Manager
- Setup RDS PostgreSQL and ElastiCache Redis
- Configure Application Load Balancer

### Traditional Server Deployment

1. **Setup server dependencies**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv postgresql-13 redis-server nginx

# CentOS/RHEL
sudo yum install python3.11 postgresql13-server redis nginx
```

2. **Deploy application**
```bash
# Clone and setup
git clone https://github.com/your-username/codebuddy.git
cd codebuddy

python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements-prod.txt

# Configure database and run migrations
python manage.py migrate
python manage.py collectstatic --noinput

# Setup systemd services for Gunicorn and Celery
sudo cp scripts/codebuddy.service /etc/systemd/system/
sudo cp scripts/codebuddy-celery.service /etc/systemd/system/

sudo systemctl enable codebuddy codebuddy-celery
sudo systemctl start codebuddy codebuddy-celery
```

3. **Configure Nginx**
```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/codebuddy
sudo ln -s /etc/nginx/sites-available/codebuddy /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## 🔧 Development

### Running Tests
```bash
# Run all tests
python manage.py test

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### Code Quality
```bash
# Format code
black .
isort .

# Lint code
flake8 .

# Type checking
mypy .
```

### Database Management
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations  
python manage.py migrate

# Reset database (development only)
python manage.py flush

# Load sample data
python manage.py loaddata fixtures/sample_data.json
```

### API Documentation
```bash
# Generate API documentation
python manage.py spectacular --file schema.yml

# View interactive API docs at:
# http://localhost:8000/api/schema/swagger-ui/
```

## 📊 Monitoring & Analytics

### Built-in Analytics Dashboard
- Access at `/analytics/` (owner/admin only)
- Real-time platform metrics
- User growth and engagement charts  
- Room activity analytics
- Moderation queue

### External Monitoring

#### Sentry (Error Tracking)
```python
# Add to production settings
SENTRY_DSN = "your-sentry-dsn"
```

#### Prometheus Metrics
```bash
# Install django-prometheus
pip install django-prometheus

# Add to INSTALLED_APPS and middleware
# Metrics available at /metrics
```

## 🛡 Security

### Security Features
- ✅ **CSRF protection** enabled
- ✅ **SQL injection** prevention
- ✅ **XSS protection** headers
- ✅ **Rate limiting** on API endpoints
- ✅ **File upload** validation
- ✅ **SSL/HTTPS** enforcement
- ✅ **Security headers** configured

### Security Checklist
- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS in production
- [ ] Configure allowed hosts
- [ ] Setup rate limiting
- [ ] Regular security updates
- [ ] Monitor error logs
- [ ] Backup database regularly

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use Black for code formatting
- Add type hints where applicable
- Write comprehensive tests
- Update documentation

## 📄 API Documentation

### Authentication
```bash
# Get auth token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

### Room API
```bash
# List rooms
curl -H "Authorization: Token your-token" \
  http://localhost:8000/api/rooms/

# Join room  
curl -X POST -H "Authorization: Token your-token" \
  http://localhost:8000/api/rooms/1/join/
```

### WebSocket Events
```javascript
// Connect to room
const socket = new WebSocket('ws://localhost:8000/ws/room/1/');

// Send message
socket.send(JSON.stringify({
    'type': 'message',
    'content': 'Hello world!'
}));
```

## 📈 Performance

### Optimization Features
- ✅ **Database indexing** on key fields
- ✅ **Redis caching** for sessions and cache
- ✅ **Static file** compression and CDN
- ✅ **WebSocket** connection pooling
- ✅ **Celery** for background tasks
- ✅ **Database** query optimization

### Performance Monitoring
- Use Django Debug Toolbar in development
- Configure APM tools (New Relic, DataDog)
- Monitor database query performance
- Track WebSocket connection metrics

## 📚 Additional Resources

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)  
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Security Policy](SECURITY.md)

## 🐛 Troubleshooting

### Common Issues

**WebSocket connection fails**
```bash
# Check Redis connection
redis-cli ping

# Verify ASGI configuration
python manage.py check --deploy
```

**Email not sending**
```bash
# Test email configuration  
python manage.py shell
from django.core.mail import send_mail
send_mail('Test', 'Message', 'from@example.com', ['to@example.com'])
```

**File uploads not working**
```bash
# Check media directory permissions
chmod 755 media/
chown -R www-data:www-data media/
```

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-username/codebuddy/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/codebuddy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/codebuddy/discussions)
- **Email**: support@codebuddy.dev

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django REST Framework team
- Channels for WebSocket support
- All contributors and beta testers
- The amazing Django community

---

**Built with ❤️ by the CodeBuddy team**

*Ready to build the future of developer communities? Start coding! 🚀*

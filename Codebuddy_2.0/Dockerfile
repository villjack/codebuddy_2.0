# CodeBuddy Production Dockerfile
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci --only=production

COPY static/ ./static/
RUN npm run build || echo "No npm build script found"

# Python backend
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=codebuddy.settings.production

# Create app user
RUN groupadd -r codebuddy && useradd -r -g codebuddy codebuddy

# Create directories
WORKDIR /app
RUN mkdir -p /app/staticfiles /app/mediafiles /app/logs
RUN chown -R codebuddy:codebuddy /app

# Install Python dependencies
COPY requirements.txt requirements-prod.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy application code
COPY . .
COPY --from=frontend-build /app/frontend/dist ./static/ || true

# Create non-root user for security
RUN chown -R codebuddy:codebuddy /app
USER codebuddy

# Collect static files
RUN python manage.py collectstatic --noinput --settings=codebuddy.settings.production

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

EXPOSE 8000

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "gevent", "--timeout", "120", "codebuddy.wsgi:application"]

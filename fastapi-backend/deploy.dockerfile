FROM python:3.11-slim

# Install system dependencies including PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    postgresql-client \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "ALTER USER postgres PASSWORD '3coinsltd';" && \
    createdb -O postgres biskaken_auto

# Switch back to root
USER root

# Create directories
RUN mkdir -p /var/log/supervisor /app

# Set working directory first
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .
COPY templates/ templates/

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app

# Configure supervisor
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:postgresql]\n\
command=/usr/lib/postgresql/17/bin/postgres -D /var/lib/postgresql/17/main -c config_file=/etc/postgresql/17/main/postgresql.conf\n\
user=postgres\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/var/log/supervisor/postgresql.log\n\
stderr_logfile=/var/log/supervisor/postgresql.log\n\
\n\
[program:fastapi]\n\
command=uvicorn main:app --host 0.0.0.0 --port 5000\n\
directory=/app\n\
user=appuser\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/var/log/supervisor/fastapi.log\n\
stderr_logfile=/var/log/supervisor/fastapi.log\n\
environment=DATABASE_URL="postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto",JWT_SECRET="biskaken-super-secure-jwt-secret-2026-v5"\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start PostgreSQL\n\
service postgresql start\n\
\n\
# Wait for PostgreSQL to be ready\n\
until su postgres -c "pg_isready"; do\n\
  echo "Waiting for PostgreSQL..."\n\
  sleep 2\n\
done\n\
\n\
echo "PostgreSQL is ready!"\n\
\n\
# Start supervisor\n\
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf\n\
' > /start.sh && chmod +x /start.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start services
CMD ["/start.sh"]
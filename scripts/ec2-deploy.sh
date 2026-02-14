#!/bin/bash

#############################################
# EC2 Auto-Deployment Script
# Pulls latest Docker images and starts containers
# Should be placed at: /opt/cafelove/deploy.sh
# Run with: bash /opt/cafelove/deploy.sh
#############################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_REGISTRY="hima1222"
BACKEND_IMAGE="$DOCKER_REGISTRY/cafelove-backend:latest"
FRONTEND_IMAGE="$DOCKER_REGISTRY/cafelove-frontend:latest"
DOCKER_COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yaml"
LOG_FILE="/var/log/cafelove-deploy.log"

# Setup logging
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "========================================="
log "🚀 EC2 Auto-Deployment Starting"
log "========================================="

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    log "❌ Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ec2-user
    systemctl restart docker
    log "✅ Docker installed"
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    log "❌ Docker Compose not found. Installing..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose installed"
fi

# Start Docker service
systemctl start docker
systemctl enable docker
log "✅ Docker service started and enabled"

# Create directory if not exists
mkdir -p "$SCRIPT_DIR"

# Login to Docker Hub (credentials passed from Ansible or Jenkins)
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
    log "🔐 Logging into Docker Hub..."
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    log "✅ Docker Hub login successful"
fi

# Pull latest images with retry
log "📦 Pulling latest Docker images..."
for image in "$BACKEND_IMAGE" "$FRONTEND_IMAGE"; do
    attempt=1
    max_attempts=3
    while [ $attempt -le $max_attempts ]; do
        if docker pull "$image"; then
            log "✅ Pulled $image"
            break
        else
            if [ $attempt -eq $max_attempts ]; then
                log "❌ Failed to pull $image after $max_attempts attempts"
                exit 1
            fi
            wait_time=$((2 ** (attempt - 1)))
            log "⚠️  Pull attempt $attempt failed. Retrying in ${wait_time}s..."
            sleep "$wait_time"
        fi
        attempt=$((attempt + 1))
    done
done

# Stop and remove old containers
log "🛑 Stopping old containers..."
cd "$SCRIPT_DIR"
docker-compose -f "$DOCKER_COMPOSE_FILE" down 2>/dev/null || true

# Start new containers
log "🚀 Starting new containers..."
if docker-compose -f "$DOCKER_COMPOSE_FILE" up -d; then
    log "✅ Containers started successfully"
else
    log "❌ Failed to start containers"
    exit 1
fi

# Wait for services to be ready
log "⏳ Waiting for services to be healthy..."
sleep 5

# Health check
attempt=1
max_attempts=10
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:5000/api/test | grep -q "Server is running"; then
        log "✅ Backend is healthy"
        break
    fi
    if [ $attempt -eq $max_attempts ]; then
        log "❌ Backend health check failed after $max_attempts attempts"
        exit 1
    fi
    log "⏳ Backend not ready yet. Attempt $attempt/$max_attempts"
    sleep 5
    attempt=$((attempt + 1))
done

log ""
log "========================================="
log "✅ EC2 Auto-Deployment Complete!"
log "========================================="
log "Frontend:  http://$(hostname -I | awk '{print $1}')"
log "Backend:   http://$(hostname -I | awk '{print $1}'):5000/api/test"
log "========================================="

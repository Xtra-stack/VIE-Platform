#!/bin/bash

# Setup local development environment
# Usage: ./scripts/setup-dev.sh

set -e

echo "🔧 Setting up VIE development environment..."

# Check prerequisites
echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ NPM is required but not installed."; exit 1; }

echo "✅ All prerequisites met"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci
cd ..

# Build and start containers
echo "🚀 Starting Docker containers..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
for i in {1..30}; do
    if curl -sf http://localhost:3000/health > /dev/null; then
        echo "✅ Backend is ready"
        break
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

# Initialize database
echo "🗄️  Initializing database..."
docker-compose exec -T backend npm run migrate || true

# Seed database (optional)
if [ "$SEED_DB" = "true" ]; then
    echo "🌱 Seeding database..."
    docker-compose exec -T backend npm run seed || true
fi

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📋 Quick start:"
echo "  - Backend:  http://localhost:3000"
echo "  - Frontend: http://localhost:5173 or http://localhost"
echo "  - MongoDB:  mongodb://localhost:27017"
echo "  - Redis:    localhost:6379"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
echo ""

#!/bin/bash

# DevbrainAI Backend Development Setup Script
set -e

echo "🚀 Setting up DevbrainAI Backend for development..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start PostgreSQL and Redis with Docker
echo "🗄️  Starting database services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are healthy
if docker-compose exec postgres pg_isready -U devbrainai -d devbrainai; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

if docker-compose exec redis redis-cli ping; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis failed to start"
    exit 1
fi

# Create database schema
echo "🏗️  Setting up database schema..."
if [ -f "../docs/architecture/database-schema.sql" ]; then
    docker-compose exec -T postgres psql -U devbrainai -d devbrainai < ../docs/architecture/database-schema.sql
    echo "✅ Database schema created"
else
    echo "⚠️  Database schema file not found, skipping..."
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys (especially CLAUDE_API_KEY)"
echo "2. Run 'npm run start:dev' to start the development server"
echo "3. Visit http://localhost:3000/health to check API health"
echo "4. Visit http://localhost:3000/api/docs for API documentation"
echo "5. Visit http://localhost:3000/graphql for GraphQL playground"
echo ""
echo "Database management:"
echo "- pgAdmin: http://localhost:8080 (admin@devbrainai.local / admin123)"
echo "- Redis Commander: http://localhost:8081"
echo ""
echo "To start admin tools: docker-compose --profile admin up -d"
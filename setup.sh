#!/bin/bash

echo "🎯 WarrantyWizard Backend Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL."
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your database credentials and OpenAI API key"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Ask if user wants to seed database
echo ""
read -p "🌱 Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running database seed..."
    npm run seed
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the server:"
echo "  npm run dev    (development mode with auto-reload)"
echo "  npm start      (production mode)"
echo ""
echo "Server will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo ""

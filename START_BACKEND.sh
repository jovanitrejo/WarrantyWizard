#!/bin/bash
echo "🚀 Starting WarrantyWizard Backend..."
echo ""
cd "$(dirname "$0")/backend"
echo "📂 Current directory: $(pwd)"
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "   Installing dependencies..."
  npm install
fi
echo ""
echo "▶️  Starting server..."
npm run dev

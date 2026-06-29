#!/bin/bash

echo "🚀 WishMatch Server Startup Script"
echo "=================================="
echo ""

echo "📋 Checking files..."
if [ ! -f "app/templates/index.html" ]; then
    echo "❌ ERROR: app/templates/index.html not found!"
    echo "   Please ensure you are on the correct branch:"
    echo "   git checkout cursor/beautiful-web-page-d9eb"
    exit 1
fi

if [ ! -d "app/static/css" ] || [ ! -d "app/static/js" ]; then
    echo "❌ ERROR: Static files not found!"
    echo "   Please ensure you are on the correct branch:"
    echo "   git checkout cursor/beautiful-web-page-d9eb"
    exit 1
fi

echo "✅ All files found"
echo ""

echo "📋 Checking .env file..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating default..."
    cat > .env << EOF
DATABASE_URL=sqlite+aiosqlite:///./test.db
SECRET_KEY=demo-secret-key-for-development
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=["*"]
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@wishmatch.app
FRONTEND_URL=http://localhost:8000
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file exists"
fi
echo ""

echo "📋 Checking Python packages..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️  FastAPI not installed. Installing dependencies..."
    pip install -r requirements.txt
else
    echo "✅ Dependencies installed"
fi
echo ""

echo "🌟 Starting server..."
echo "=================================="
echo ""
echo "📍 Server will be available at:"
echo "   🌐 http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

#!/usr/bin/env python3
"""Diagnostic script to check WishMatch setup."""

import sys
from pathlib import Path


def check_files():
    """Check if all required files exist."""
    print("📋 Checking files...")
    
    required_files = [
        "app/templates/index.html",
        "app/static/css/style.css",
        "app/static/js/main.js",
        "app/main.py",
    ]
    
    all_ok = True
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} NOT FOUND!")
            all_ok = False
    
    return all_ok


def check_env():
    """Check .env file."""
    print("\n📋 Checking .env file...")
    
    env_file = Path(".env")
    if env_file.exists():
        print("  ✅ .env exists")
        return True
    else:
        print("  ⚠️  .env not found - will create")
        
        env_content = """DATABASE_URL=sqlite+aiosqlite:///./test.db
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
"""
        env_file.write_text(env_content)
        print("  ✅ Created .env file")
        return True


def check_dependencies():
    """Check if required packages are installed."""
    print("\n📋 Checking dependencies...")
    
    required_packages = ["fastapi", "uvicorn"]
    all_ok = True
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} NOT INSTALLED!")
            all_ok = False
    
    if not all_ok:
        print("\n  💡 Install with: pip install -r requirements.txt")
    
    return all_ok


def main():
    """Run all checks."""
    print("🚀 WishMatch Diagnostic Tool")
    print("=" * 50)
    print()
    
    files_ok = check_files()
    env_ok = check_env()
    deps_ok = check_dependencies()
    
    print("\n" + "=" * 50)
    
    if files_ok and env_ok and deps_ok:
        print("✅ All checks passed!")
        print("\n🌟 To start the server, run:")
        print("   ./start_server.sh")
        print("   or")
        print("   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        print("\n📍 Then open: http://localhost:8000")
        return 0
    else:
        print("❌ Some checks failed!")
        if not files_ok:
            print("\n💡 Make sure you're on the correct branch:")
            print("   git checkout cursor/beautiful-web-page-d9eb")
        return 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Test database connection for KnowledgeNest
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test the database connection"""
    
    # Database configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'knowledgenest')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'KnowledgeNest2024!')
    MYSQL_DB = os.getenv('MYSQL_DB', 'knowledgenest_db')
    
    # Create database URL
    database_url = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'
    
    try:
        print("🔍 Testing database connection...")
        print(f"Host: {MYSQL_HOST}")
        print(f"Database: {MYSQL_DB}")
        print(f"User: {MYSQL_USER}")
        print()
        
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as connection:
            # Test basic connection
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            
            # Check tables
            result = connection.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            print(f"📋 Found {len(tables)} tables: {', '.join(tables)}")
            
            # Check users table
            result = connection.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.fetchone()[0]
            print(f"👥 Users in database: {user_count}")
            
            # Check courses table
            result = connection.execute(text("SELECT COUNT(*) FROM courses"))
            course_count = result.fetchone()[0]
            print(f"📚 Courses in database: {course_count}")
            
            print()
            print("🎉 Database setup is complete and working!")
            return True
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print()
        print("🔧 Troubleshooting steps:")
        print("1. Make sure MySQL is running: brew services start mysql")
        print("2. Check your credentials in backend/.env")
        print("3. Verify the database exists: mysql -u root -p")
        print("4. Run: SHOW DATABASES; to see available databases")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
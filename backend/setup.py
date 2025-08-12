#!/usr/bin/env python3
"""
Setup script for KnowledgeNest Backend
"""

import os
import sys
import subprocess
from werkzeug.security import generate_password_hash

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def setup_database():
    """Setup MySQL database"""
    print("\nSetting up database...")
    print("Please make sure MySQL is running and execute the following:")
    print("1. Login to MySQL as root: mysql -u root -p")
    print("2. Run the database_setup.sql file: source database_setup.sql")
    print("3. Create a user for the application:")
    print("   CREATE USER 'knowledgenest'@'localhost' IDENTIFIED BY 'your_password';")
    print("   GRANT ALL PRIVILEGES ON knowledgenest_db.* TO 'knowledgenest'@'localhost';")
    print("   FLUSH PRIVILEGES;")

def create_env_file():
    """Create environment file"""
    env_content = """# KnowledgeNest Backend Environment Variables
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-string-change-in-production

# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=knowledgenest
MYSQL_PASSWORD=your_password
MYSQL_DB=knowledgenest_db
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("\nCreated .env file. Please update the database credentials.")

def main():
    print("KnowledgeNest Backend Setup")
    print("=" * 30)
    
    try:
        install_requirements()
        create_env_file()
        setup_database()
        
        print("\nSetup completed successfully!")
        print("\nNext steps:")
        print("1. Update the .env file with your database credentials")
        print("2. Setup the MySQL database using database_setup.sql")
        print("3. Run the application: python app.py")
        
    except Exception as e:
        print(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
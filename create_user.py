#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from werkzeug.security import generate_password_hash
import mysql.connector
from datetime import datetime

# Database connection
db_config = {
    'host': 'localhost',
    'user': 'knowledgenest',
    'password': 'KnowledgeNest2024!',
    'database': 'knowledgenest_db'
}

def create_user(name, email, password, role='student'):
    try:
        # Generate password hash
        password_hash = generate_password_hash(password)
        
        # Connect to database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"User with email {email} already exists!")
            return False
        
        # Insert new user
        query = """
        INSERT INTO users (name, email, password_hash, role, profile_image, created_at, updated_at, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        now = datetime.now()
        values = (name, email, password_hash, role, 'default.jpg', now, now, True)
        
        cursor.execute(query, values)
        conn.commit()
        
        user_id = cursor.lastrowid
        print(f"✅ User '{name}' created successfully with ID: {user_id}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False

if __name__ == "__main__":
    # Create Aayushman user
    success = create_user(
        name="Aayushman",
        email="aayushman@knowledgenest.com", 
        password="aayushman123",
        role="student"
    )
    
    if success:
        print("\n🎉 Aayushman can now login with:")
        print("Email: aayushman@knowledgenest.com")
        print("Password: aayushman123")
    else:
        print("\n❌ Failed to create user")
#!/bin/bash

echo "🔧 KnowledgeNest Database Fix Tool"
echo "=================================="
echo ""

# Test current connection
echo "Testing current database connection..."
mysql -u knowledgenest -pKnowledgeNest2024! knowledgenest_db -e "SELECT 'Connection successful!' as status;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection is working!"
    echo ""
    echo "Checking if email 'vihaan@icloud.com' exists:"
    mysql -u knowledgenest -pKnowledgeNest2024! knowledgenest_db -e "SELECT id, name, email, role FROM users WHERE email = 'vihaan@icloud.com';"
    
    echo ""
    echo "All registered users:"
    mysql -u knowledgenest -pKnowledgeNest2024! knowledgenest_db -e "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;"
else
    echo "❌ Database connection failed!"
    echo ""
    echo "Let's fix the database setup..."
    echo ""
    
    echo "Option 1: Reset database with correct password"
    echo "============================================="
    echo "This will create the database user with the correct password."
    echo ""
    
    read -p "Do you want to reset the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please run these commands in MySQL as root:"
        echo ""
        echo "mysql -u root -p"
        echo ""
        echo "Then run these SQL commands:"
        echo "DROP USER IF EXISTS 'knowledgenest'@'localhost';"
        echo "CREATE USER 'knowledgenest'@'localhost' IDENTIFIED BY 'KnowledgeNest2024!';"
        echo "CREATE DATABASE IF NOT EXISTS knowledgenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        echo "GRANT ALL PRIVILEGES ON knowledgenest_db.* TO 'knowledgenest'@'localhost';"
        echo "FLUSH PRIVILEGES;"
        echo "EXIT;"
        echo ""
        echo "Then import the schema:"
        echo "mysql -u knowledgenest -pKnowledgeNest2024! knowledgenest_db < backend/database_setup.sql"
    fi
fi
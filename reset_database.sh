#!/bin/bash

echo "Resetting KnowledgeNest Database..."

# Drop and recreate the database
mysql -u knowledgenest -p knowledgenest_db << EOF
DROP DATABASE IF EXISTS knowledgenest_db;
CREATE DATABASE knowledgenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE knowledgenest_db;
EOF

# Import fresh schema
mysql -u knowledgenest -p knowledgenest_db < backend/database_setup.sql

echo "Database reset complete! You can now register with any email."
echo ""
echo "Available test accounts:"
echo "  Admin:      admin@knowledgenest.com / admin123"
echo "  Instructor: john@example.com / john123"
echo "  Student:    jane@example.com / jane123"
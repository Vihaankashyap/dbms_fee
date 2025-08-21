#!/bin/bash

echo "Checking if email exists in database..."
echo "Enter the MySQL password for 'knowledgenest' user when prompted:"

mysql -u knowledgenest -p knowledgenest_db << EOF
SELECT 'Checking email: vihaan@icloud.com' as status;
SELECT id, name, email, role, created_at FROM users WHERE email = 'vihaan@icloud.com';

SELECT 'All registered emails:' as status;
SELECT id, name, email, role FROM users ORDER BY created_at DESC;
EOF
#!/bin/bash

# KnowledgeNest Real-time Data Monitor

DB_USER="knowledgenest"
DB_PASS="KnowledgeNest2024!"
DB_NAME="knowledgenest_db"

echo "🔄 Real-time Data Monitor - KnowledgeNest"
echo "========================================"

while true; do
    clear
    echo "🔄 Real-time Data Monitor - KnowledgeNest"
    echo "========================================"
    echo "Last updated: $(date)"
    echo ""
    
    echo "📊 LIVE STATISTICS:"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    SELECT 
        'Active Users' as metric,
        COUNT(*) as count
    FROM users WHERE is_active = 1
    UNION ALL
    SELECT 
        'Published Courses' as metric,
        COUNT(*) as count
    FROM courses WHERE is_published = 1
    UNION ALL
    SELECT 
        'Active Enrollments' as metric,
        COUNT(*) as count
    FROM enrollments
    UNION ALL
    SELECT 
        'Recent Logins (Today)' as metric,
        COUNT(*) as count
    FROM user_activities 
    WHERE action_type = 'login' 
    AND DATE(created_at) = CURDATE();
    " 2>/dev/null
    
    echo ""
    echo "🆕 RECENT ACTIVITIES (Last 5):"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    SELECT 
        u.name as user,
        a.action_type as action,
        TIME(a.created_at) as time
    FROM user_activities a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 5;
    " 2>/dev/null
    
    echo ""
    echo "Press Ctrl+C to stop monitoring..."
    sleep 5
done
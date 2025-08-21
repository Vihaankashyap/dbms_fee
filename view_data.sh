#!/bin/bash

# KnowledgeNest Database Viewer Script

echo "🗄️  KnowledgeNest Database Data Viewer"
echo "====================================="

# Database credentials
DB_USER="knowledgenest"
DB_PASS="KnowledgeNest2024!"
DB_NAME="knowledgenest_db"

echo ""
echo "📊 USERS TABLE:"
echo "---------------"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    name,
    email,
    role,
    profile_image,
    DATE(created_at) as joined_date,
    TIME(created_at) as joined_time,
    is_active
FROM users 
ORDER BY created_at DESC;
"

echo ""
echo "📚 COURSES TABLE:"
echo "-----------------"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    title,
    category,
    instructor_id,
    (SELECT name FROM users WHERE id = courses.instructor_id) as instructor_name,
    price,
    difficulty_level,
    is_published,
    DATE(created_at) as created_date
FROM courses 
ORDER BY id;
"

echo ""
echo "🎓 ENROLLMENTS TABLE:"
echo "---------------------"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    e.id,
    u.name as student_name,
    c.title as course_title,
    DATE(e.enrolled_at) as enrolled_date,
    e.progress_percentage,
    CASE 
        WHEN e.completed_at IS NOT NULL THEN 'Completed'
        ELSE 'In Progress'
    END as status,
    e.rating
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC;
"

echo ""
echo "📝 LESSONS TABLE:"
echo "-----------------"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    l.id,
    c.title as course_title,
    l.title as lesson_title,
    l.order_index,
    l.duration_minutes
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.id, l.order_index;
"

echo ""
echo "📈 USER ACTIVITIES TABLE:"
echo "-------------------------"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    a.id,
    u.name as user_name,
    a.action_type,
    a.description,
    DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i') as activity_time
FROM user_activities a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 10;
"

echo ""
echo "📊 QUICK STATISTICS:"
echo "--------------------"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Total Courses' as metric,
    COUNT(*) as count
FROM courses
UNION ALL
SELECT 
    'Total Enrollments' as metric,
    COUNT(*) as count
FROM enrollments
UNION ALL
SELECT 
    'Completed Courses' as metric,
    COUNT(*) as count
FROM enrollments 
WHERE completed_at IS NOT NULL;
"

echo ""
echo "💡 To view data interactively:"
echo "   mysql -u knowledgenest -pKnowledgeNest2024! knowledgenest_db"
echo ""
echo "💡 To view specific table:"
echo "   mysql -u knowledgenest -pKnowledgeNest2024! knowledgenest_db -e 'SELECT * FROM users;'"
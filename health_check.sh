#!/bin/bash

# KnowledgeNest Health Check Script

echo "🏥 KnowledgeNest Health Check"
echo "============================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if MySQL is running
echo -n "🗄️  MySQL Service: "
if pgrep -x "mysqld" > /dev/null; then
    echo -e "${GREEN}Running${NC}"
else
    echo -e "${RED}Not Running${NC}"
    echo "   Start with: brew services start mysql"
fi

# Check if backend is running
echo -n "🐍 Backend (Port 5001): "
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${GREEN}Running${NC}"
    # Test API endpoint
    if curl -s http://localhost:5001/api/courses >/dev/null 2>&1; then
        echo "   ✅ API responding"
    else
        echo -e "   ${YELLOW}⚠️  API not responding${NC}"
    fi
else
    echo -e "${RED}Not Running${NC}"
    echo "   Start with: cd backend && python app.py"
fi

# Check if frontend is running
echo -n "🌐 Frontend (Port 8080): "
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${GREEN}Running${NC}"
    echo "   🌍 Access at: http://localhost:8080"
else
    echo -e "${RED}Not Running${NC}"
    echo "   Start with: cd CODES && python3 -m http.server 8080"
fi

# Check database connection
echo -n "🔗 Database Connection: "
cd backend 2>/dev/null
if [ -f "test_db.py" ] && python test_db.py >/dev/null 2>&1; then
    echo -e "${GREEN}Connected${NC}"
else
    echo -e "${RED}Failed${NC}"
    echo "   Run: cd backend && python test_db.py"
fi

echo ""
echo "📋 Quick Actions:"
echo "   Start everything: ./start.sh"
echo "   Stop everything: Ctrl+C in terminal running start.sh"
echo "   View logs: Check terminal output"
echo ""
echo "🌐 Application URLs:"
echo "   Home:     http://localhost:8080/home.html"
echo "   Login:    http://localhost:8080/login.html"
echo "   Register: http://localhost:8080/register.html"
echo "   Dashboard: http://localhost:8080/dashboard.html"
echo "   Backend:  http://localhost:5001/api"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:    admin@knowledgenest.com / admin123"
echo "   Student:  jane@example.com / jane123"
echo "   Instructor: john@example.com / john123"
#!/bin/bash

# KnowledgeNest Startup Script

echo "Starting KnowledgeNest Learning Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "MySQL is not running. Please start MySQL service."
    exit 1
fi

# Start backend server
echo "Starting backend server..."
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install requirements if needed
if [ ! -f ".requirements_installed" ]; then
    echo "Installing Python requirements..."
    pip install -r requirements.txt
    touch .requirements_installed
fi

# Start Flask backend server in background
python app.py &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"

# Start frontend server
echo "Starting frontend server..."
cd ../CODES

# Start simple HTTP server
python3 -m http.server 8080 &
FRONTEND_PID=$!

echo "Frontend server started with PID: $FRONTEND_PID"

echo ""
echo "🚀 KnowledgeNest is now running!"
echo ""
echo "📱 Frontend URLs:"
echo "   Home:     http://localhost:8080/home.html"
echo "   Login:    http://localhost:8080/login.html"
echo "   Register: http://localhost:8080/register.html"
echo "   Dashboard: http://localhost:8080/dashboard.html"
echo ""
echo "🔧 Backend API: http://localhost:5001/api"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:    admin@knowledgenest.com / admin123"
echo "   Student:  jane@example.com / jane123"
echo "   Instructor: john@example.com / john123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
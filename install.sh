#!/bin/bash

# KnowledgeNest Installation Script

echo "🎓 KnowledgeNest Learning Platform Installation"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3 is installed
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed."
    print_status "Please install Python 3.8 or higher and run this script again."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_success "Python $PYTHON_VERSION found"

# Check if MySQL is installed
print_status "Checking MySQL installation..."
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL not found in PATH."
    print_status "Please ensure MySQL is installed and accessible."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "MySQL found"
fi

# Create backend virtual environment
print_status "Setting up Python virtual environment..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate
print_success "Virtual environment activated"

# Install Python requirements
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_success "Python dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating environment configuration file..."
    cp .env.example .env
    print_success "Environment file created"
    print_warning "Please edit backend/.env with your database credentials"
else
    print_warning "Environment file already exists"
fi

# Go back to project root
cd ..

# Make scripts executable
chmod +x start.sh
print_success "Made startup script executable"

echo ""
print_success "Installation completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up MySQL database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE knowledgenest_db;"
echo "   CREATE USER 'knowledgenest'@'localhost' IDENTIFIED BY 'your_password';"
echo "   GRANT ALL PRIVILEGES ON knowledgenest_db.* TO 'knowledgenest'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "2. Import database schema:"
echo "   mysql -u knowledgenest -p knowledgenest_db < backend/database_setup.sql"
echo ""
echo "3. Update database credentials in backend/.env"
echo ""
echo "4. Start the application:"
echo "   ./start.sh"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:5000"
echo ""
echo "🔑 Default admin login:"
echo "   Email: admin@knowledgenest.com"
echo "   Password: admin123"
echo ""
print_warning "Remember to change the default admin password!"
echo ""
echo "📖 For detailed instructions, see README.md or QUICK_START.md"
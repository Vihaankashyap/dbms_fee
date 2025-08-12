# Quick Start Guide - KnowledgeNest

## 🚀 Get Started in 5 Minutes

### Step 1: Install MySQL
Make sure MySQL is installed and running on your system.

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
Download and install from [MySQL official website](https://dev.mysql.com/downloads/mysql/)

### Step 2: Set up Database
```bash
# Login to MySQL as root
mysql -u root -p

# Run these commands in MySQL:
CREATE DATABASE knowledgenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'knowledgenest'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON knowledgenest_db.* TO 'knowledgenest'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import the database schema
mysql -u knowledgenest -p knowledgenest_db < backend/database_setup.sql
```

### Step 3: Configure Backend
```bash
cd backend
cp .env.example .env

# Edit .env file with your database password:
# MYSQL_PASSWORD=password123
```

### Step 4: Install Python Dependencies
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### Step 5: Start the Application
```bash
# Go back to project root
cd ..

# Run the startup script
./start.sh
```

### Step 6: Access the Application
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:5000

### Default Admin Login
- **Email:** admin@knowledgenest.com
- **Password:** admin123

## 🎯 What You Can Do Now

### As a Student:
1. Register a new account
2. Browse and enroll in courses
3. Track your learning progress
4. Upload profile pictures

### As an Admin:
1. Login with admin credentials
2. View analytics dashboard
3. Monitor user activity
4. Track course performance

## 🔧 Troubleshooting

**Database Connection Issues:**
- Make sure MySQL is running
- Check database credentials in `.env`
- Verify database exists: `SHOW DATABASES;`

**Port Already in Use:**
- Backend (5000): `lsof -ti:5000 | xargs kill -9`
- Frontend (8080): `lsof -ti:8080 | xargs kill -9`

**Python Module Errors:**
- Make sure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

## 📚 Next Steps

1. **Customize the Design:** Edit CSS files in `CODES/style.css`
2. **Add More Courses:** Use the admin panel or database
3. **Extend API:** Add new endpoints in `backend/app.py`
4. **Deploy:** Follow the deployment guide in README.md

## 🆘 Need Help?

Check the full README.md for detailed documentation and troubleshooting.
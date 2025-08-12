# KnowledgeNest Learning Platform

A comprehensive learning management system built with Python Flask backend and HTML/CSS/JavaScript frontend, integrated with MySQL database.

## Features

### Student Features
- User registration and authentication
- Course browsing and enrollment
- Profile management with image upload
- Progress tracking
- Course completion certificates

### Admin Features
- Analytics dashboard with real-time data
- User management
- Course management
- Activity monitoring
- Revenue tracking

### Technical Features
- RESTful API with Flask
- MySQL database integration
- JWT authentication
- File upload handling
- CORS support for frontend integration
- Responsive design

## Technology Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6+)** - Interactive functionality
- **Chart.js** - Analytics visualization
- **Font Awesome** - Icons

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- MySQL 8.0 or higher
- Node.js (optional, for serving frontend)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FEE-PROJECT
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up MySQL database**
   ```bash
   # Login to MySQL as root
   mysql -u root -p
   
   # Create database and user
   CREATE DATABASE knowledgenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'knowledgenest'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON knowledgenest_db.* TO 'knowledgenest'@'localhost';
   FLUSH PRIVILEGES;
   
   # Run the setup script
   source database_setup.sql;
   ```

5. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Edit .env with your database credentials
   MYSQL_USER=knowledgenest
   MYSQL_PASSWORD=your_password
   MYSQL_DB=knowledgenest_db
   ```

6. **Run the backend server**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd CODES
   ```

2. **Serve the frontend files**
   
   **Option 1: Using Python's built-in server**
   ```bash
   python -m http.server 8080
   ```
   
   **Option 2: Using Node.js http-server**
   ```bash
   npx http-server -p 8080 -c-1
   ```
   
   **Option 3: Using any web server (Apache, Nginx, etc.)**

3. **Access the application**
   Open your browser and go to `http://localhost:8080`

## Application URLs

Once both servers are running, you can access:

### **Frontend Pages:**
- **Home Page**: http://localhost:8080/home.html
- **Login Page**: http://localhost:8080/login.html
- **Register Page**: http://localhost:8080/register.html
- **Dashboard (Admin)**: http://localhost:8080/dashboard.html
- **Profile Page**: http://localhost:8080/profile.html
- **Courses Page**: http://localhost:8080/courses.html
- **About Page**: http://localhost:8080/about.html
- **Contact Page**: http://localhost:8080/contact.html

### **Backend API Endpoints:**
- **Base URL**: http://localhost:5001/api
- **Login**: http://localhost:5001/api/login
- **Register**: http://localhost:5001/api/register
- **Courses**: http://localhost:5001/api/courses
- **Profile**: http://localhost:5001/api/profile

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - Encrypted password
- `role` - User role (student, instructor, admin)
- `profile_image` - Profile image filename
- `created_at`, `updated_at` - Timestamps
- `is_active` - Account status

### Courses Table
- `id` - Primary key
- `title` - Course title
- `description` - Course description
- `category` - Course category
- `instructor_id` - Foreign key to users table
- `price` - Course price
- `duration_hours` - Course duration
- `difficulty_level` - Beginner/Intermediate/Advanced
- `is_published` - Publication status

### Enrollments Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `course_id` - Foreign key to courses
- `enrolled_at` - Enrollment timestamp
- `completed_at` - Completion timestamp
- `progress_percentage` - Course progress
- `rating` - Course rating (1-5)
- `review` - Course review

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/upload-profile-image` - Upload profile image

### Courses
- `GET /api/courses` - Get all courses (with pagination)
- `GET /api/courses/<id>` - Get specific course
- `POST /api/enroll` - Enroll in a course
- `GET /api/my-courses` - Get user's enrolled courses

### Analytics (Admin only)
- `GET /api/analytics/overview` - Get dashboard overview
- `GET /api/analytics/activity` - Get recent user activity

## Default Admin Account

After running the database setup, a default admin account is created:
- **Email:** admin@knowledgenest.com
- **Password:** admin123

**Important:** Change this password in production!

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-string-change-in-production

# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=knowledgenest
MYSQL_PASSWORD=your_password
MYSQL_DB=knowledgenest_db
```

### Frontend Configuration
Update the API base URL in `CODES/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Usage

### For Students
1. Register a new account or login
2. Browse available courses
3. Enroll in courses
4. Track your progress
5. Rate and review completed courses

### For Admins
1. Login with admin credentials
2. Access the analytics dashboard
3. Monitor user activity and course performance
4. View enrollment statistics and revenue data

## Development

### Adding New Features
1. Create database migrations for schema changes
2. Add new API endpoints in `backend/app.py`
3. Update frontend JavaScript to consume new APIs
4. Test thoroughly before deployment

### Database Migrations
When making schema changes:
1. Update the models in `app.py`
2. Create migration SQL scripts
3. Update `database_setup.sql` for fresh installations

## Deployment

### Production Considerations
1. Use a production WSGI server (Gunicorn, uWSGI)
2. Set up a reverse proxy (Nginx, Apache)
3. Use environment variables for sensitive configuration
4. Enable SSL/HTTPS
5. Set up database backups
6. Configure logging and monitoring

### Example Production Setup
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database and user exist

2. **CORS Errors**
   - Check frontend URL is in CORS_ORIGINS config
   - Verify API base URL in frontend

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure allowed file extensions

4. **Authentication Issues**
   - Check JWT secret key configuration
   - Verify token expiration settings
   - Clear browser localStorage if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
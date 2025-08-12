-- Create database
CREATE DATABASE IF NOT EXISTS knowledgenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE knowledgenest_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    profile_image VARCHAR(255) DEFAULT 'default.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    thumbnail VARCHAR(255) DEFAULT 'default-course.jpg',
    instructor_id INT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    duration_hours INT DEFAULT 0,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_instructor (instructor_id),
    INDEX idx_published (is_published)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress_percentage FLOAT DEFAULT 0.0,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_completed (completed_at)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    order_index INT DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_order (course_id, order_index)
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type ENUM('login', 'register', 'enrollment', 'completion', 'logout') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_action_type (action_type)
);

-- Insert sample data
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@knowledgenest.com', 'pbkdf2:sha256:260000$salt$hash', 'admin'),
('John Doe', 'john@example.com', 'pbkdf2:sha256:260000$salt$hash', 'instructor'),
('Jane Smith', 'jane@example.com', 'pbkdf2:sha256:260000$salt$hash', 'student');

INSERT INTO courses (title, description, category, instructor_id, price, duration_hours, difficulty_level, is_published) VALUES 
('Complete Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, React, Node.js and more', 'Web Development', 2, 99.99, 40, 'beginner', TRUE),
('JavaScript Mastery Course', 'Master JavaScript from basics to advanced concepts', 'Programming', 2, 79.99, 30, 'intermediate', TRUE),
('Python for Data Science', 'Learn Python programming for data analysis and machine learning', 'Data Science', 2, 89.99, 35, 'beginner', TRUE);

INSERT INTO lessons (course_id, title, content, order_index, duration_minutes) VALUES 
(1, 'Introduction to HTML', 'Learn the basics of HTML markup language', 1, 45),
(1, 'CSS Fundamentals', 'Understanding CSS styling and layout', 2, 60),
(1, 'JavaScript Basics', 'Introduction to JavaScript programming', 3, 75),
(2, 'Variables and Data Types', 'Understanding JavaScript variables and data types', 1, 40),
(2, 'Functions and Scope', 'Learn about JavaScript functions and scope', 2, 50);

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_courses_created_at ON courses(created_at);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at);
CREATE INDEX idx_activities_created_at ON user_activities(created_at);
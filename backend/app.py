from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from decimal import Decimal
import os
import uuid
from config import config

app = Flask(__name__)

# Load configuration
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Initialize extensions
db = SQLAlchemy(app)

# Configure CORS with specific settings for frontend-backend separation
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

jwt = JWTManager(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'instructor', 'admin'), default='student')
    profile_image = db.Column(db.String(255), default='default.jpg')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    enrollments = db.relationship('Enrollment', backref='user', lazy=True)
    courses_created = db.relationship('Course', backref='instructor', lazy=True)
    activities = db.relationship('UserActivity', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=False)
    thumbnail = db.Column(db.String(255), default='default-course.jpg')
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), default=0.00)
    duration_hours = db.Column(db.Integer, default=0)
    difficulty_level = db.Column(db.Enum('beginner', 'intermediate', 'advanced'), default='beginner')
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    enrollments = db.relationship('Enrollment', backref='course', lazy=True)
    lessons = db.relationship('Lesson', backref='course', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'thumbnail': self.thumbnail,
            'instructor_id': self.instructor_id,
            'instructor_name': self.instructor.name if self.instructor else None,
            'price': float(self.price),
            'duration_hours': self.duration_hours,
            'difficulty_level': self.difficulty_level,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat(),
            'enrollment_count': len(self.enrollments)
        }

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    progress_percentage = db.Column(db.Float, default=0.0)
    rating = db.Column(db.Integer)  # 1-5 stars
    review = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'enrolled_at': self.enrolled_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'progress_percentage': self.progress_percentage,
            'rating': self.rating,
            'review': self.review
        }

class Lesson(db.Model):
    __tablename__ = 'lessons'
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    order_index = db.Column(db.Integer, default=0)
    duration_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserActivity(db.Model):
    __tablename__ = 'user_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action_type = db.Column(db.Enum('login', 'register', 'enrollment', 'completion', 'logout'), nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'action_type': self.action_type,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

# API Routes

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ('name', 'email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            role=data.get('role', 'student')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Log activity
        activity = UserActivity(
            user_id=user.id,
            action_type='register',
            description=f'User {user.name} registered'
        )
        db.session.add(activity)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']) and user.is_active:
            # Log activity
            activity = UserActivity(
                user_id=user.id,
                action_type='login',
                description=f'User {user.name} logged in'
            )
            db.session.add(activity)
            db.session.commit()
            
            access_token = create_access_token(identity=user.id)
            
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-user', methods=['POST'])
def check_user():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        return jsonify({
            'exists': user is not None,
            'user': user.to_dict() if user else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's enrollments
        enrollments = Enrollment.query.filter_by(user_id=user_id).all()
        
        profile_data = user.to_dict()
        profile_data['enrollments'] = [enrollment.to_dict() for enrollment in enrollments]
        profile_data['total_courses'] = len(enrollments)
        profile_data['completed_courses'] = len([e for e in enrollments if e.completed_at])
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already taken'}), 400
            user.email = data['email']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-profile-image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'profiles', filename)
            
            file.save(filepath)
            
            # Update user profile image
            user.profile_image = filename
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Profile image uploaded successfully',
                'profile_image': filename
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Course Routes
@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Course.query.filter_by(is_published=True)
        
        if category:
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(Course.title.contains(search))
        
        courses = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'courses': [course.to_dict() for course in courses.items],
            'total': courses.total,
            'pages': courses.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    try:
        course = Course.query.get(course_id)
        
        if not course or not course.is_published:
            return jsonify({'error': 'Course not found'}), 404
        
        course_data = course.to_dict()
        
        # Get course lessons
        lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_index).all()
        course_data['lessons'] = [
            {
                'id': lesson.id,
                'title': lesson.title,
                'duration_minutes': lesson.duration_minutes,
                'order_index': lesson.order_index
            } for lesson in lessons
        ]
        
        # Get average rating
        enrollments_with_rating = Enrollment.query.filter_by(course_id=course_id).filter(Enrollment.rating.isnot(None)).all()
        if enrollments_with_rating:
            avg_rating = sum(e.rating for e in enrollments_with_rating) / len(enrollments_with_rating)
            course_data['average_rating'] = round(avg_rating, 1)
            course_data['total_ratings'] = len(enrollments_with_rating)
        else:
            course_data['average_rating'] = 0
            course_data['total_ratings'] = 0
        
        return jsonify(course_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/enroll', methods=['POST'])
@jwt_required()
def enroll_course():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'course_id' not in data:
            return jsonify({'error': 'Course ID required'}), 400
        
        course_id = data['course_id']
        
        # Check if course exists
        course = Course.query.get(course_id)
        if not course or not course.is_published:
            return jsonify({'error': 'Course not found'}), 404
        
        # Check if already enrolled
        existing_enrollment = Enrollment.query.filter_by(
            user_id=user_id, course_id=course_id
        ).first()
        
        if existing_enrollment:
            return jsonify({'error': 'Already enrolled in this course'}), 400
        
        # Create enrollment
        enrollment = Enrollment(
            user_id=user_id,
            course_id=course_id
        )
        
        db.session.add(enrollment)
        
        # Log activity
        user = User.query.get(user_id)
        activity = UserActivity(
            user_id=user_id,
            action_type='enrollment',
            description=f'User {user.name} enrolled in {course.title}'
        )
        db.session.add(activity)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully enrolled in course',
            'enrollment': enrollment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/my-courses', methods=['GET'])
@jwt_required()
def get_my_courses():
    try:
        user_id = get_jwt_identity()
        
        enrollments = db.session.query(Enrollment, Course).join(
            Course, Enrollment.course_id == Course.id
        ).filter(Enrollment.user_id == user_id).all()
        
        courses_data = []
        for enrollment, course in enrollments:
            course_data = course.to_dict()
            course_data['enrollment'] = enrollment.to_dict()
            courses_data.append(course_data)
        
        return jsonify({'courses': courses_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complete-course', methods=['POST'])
@jwt_required()
def complete_course():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'course_id' not in data:
            return jsonify({'error': 'Course ID required'}), 400
        
        course_id = data['course_id']
        
        # Find the enrollment
        enrollment = Enrollment.query.filter_by(
            user_id=user_id, course_id=course_id
        ).first()
        
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        # Mark as completed
        enrollment.completed_at = datetime.utcnow()
        enrollment.progress_percentage = 100.0
        
        # Add rating if provided
        if 'rating' in data and 1 <= data['rating'] <= 5:
            enrollment.rating = data['rating']
        
        # Add review if provided
        if 'review' in data:
            enrollment.review = data['review']
        
        db.session.commit()
        
        # Log completion activity
        user = User.query.get(user_id)
        course = Course.query.get(course_id)
        activity = UserActivity(
            user_id=user_id,
            action_type='completion',
            description=f'User {user.name} completed {course.title}'
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'Course completed successfully',
            'enrollment': enrollment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Analytics Routes
@app.route('/api/analytics/overview', methods=['GET'])
@jwt_required()
def get_analytics_overview():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Only admin users can access analytics
        if user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get overview statistics
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_instructors = User.query.filter_by(role='instructor').count()
        total_courses = Course.query.filter_by(is_published=True).count()
        total_enrollments = Enrollment.query.count()
        completed_enrollments = Enrollment.query.filter(Enrollment.completed_at.isnot(None)).count()
        
        # Calculate average rating
        enrollments_with_rating = Enrollment.query.filter(Enrollment.rating.isnot(None)).all()
        avg_rating = 0
        if enrollments_with_rating:
            avg_rating = sum(e.rating for e in enrollments_with_rating) / len(enrollments_with_rating)
        
        # Get period-based statistics (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users_period = User.query.filter(User.created_at >= thirty_days_ago).count()
        new_courses_period = Course.query.filter(Course.created_at >= thirty_days_ago).count()
        new_enrollments_period = Enrollment.query.filter(Enrollment.enrolled_at >= thirty_days_ago).count()
        
        return jsonify({
            'users': {
                'total_users': total_users,
                'students': total_students,
                'instructors': total_instructors,
                'new_users_period': new_users_period
            },
            'courses': {
                'total_courses': total_courses,
                'published_courses': total_courses,
                'new_courses_period': new_courses_period,
                'avg_rating': round(avg_rating, 1)
            },
            'enrollments': {
                'total_enrollments': total_enrollments,
                'completed_enrollments': completed_enrollments,
                'new_enrollments_period': new_enrollments_period
            },
            'revenue': {
                'total_revenue': 0,  # Implement based on your pricing model
                'revenue_period': 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/users', methods=['GET'])
@jwt_required()
def get_users_analytics():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get all users with basic info
        users = User.query.order_by(User.created_at.desc()).limit(50).all()
        
        users_data = []
        for u in users:
            users_data.append({
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'role': u.role,
                'is_active': u.is_active,
                'created_at': u.created_at.isoformat(),
                'profile_image': u.profile_image
            })
        
        return jsonify({
            'users': users_data,
            'total_count': User.query.count()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/real-time', methods=['GET'])
@jwt_required()
def get_real_time_analytics():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get real-time statistics
        total_users = User.query.count()
        total_courses = Course.query.count()
        total_enrollments = Enrollment.query.count()
        
        # Active users today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        active_users_today = UserActivity.query.filter(
            UserActivity.action_type == 'login',
            UserActivity.created_at >= today
        ).distinct(UserActivity.user_id).count()
        
        # Registration trends (last 7 days)
        registration_trends = []
        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            daily_registrations = User.query.filter(
                User.created_at >= start_of_day,
                User.created_at <= end_of_day
            ).count()
            
            registration_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'registrations': daily_registrations
            })
        
        return jsonify({
            'total_users': total_users,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'active_users_today': active_users_today,
            'registration_trends': list(reversed(registration_trends)),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/course-progress', methods=['GET'])
@jwt_required()
def get_course_progress_analytics():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get course progress data
        courses = Course.query.filter_by(is_published=True).all()
        course_progress_data = []
        
        for course in courses:
            # Get enrollments for this course
            enrollments = Enrollment.query.filter_by(course_id=course.id).all()
            
            if not enrollments:
                continue
                
            total_enrollments = len(enrollments)
            completed_enrollments = len([e for e in enrollments if e.completed_at])
            
            # Calculate average progress
            total_progress = sum(e.progress_percentage for e in enrollments)
            avg_progress = total_progress / total_enrollments if total_enrollments > 0 else 0
            
            # Get recent progress updates (last 24 hours)
            yesterday = datetime.now() - timedelta(days=1)
            recent_updates = [e for e in enrollments if e.updated_at and e.updated_at >= yesterday]
            
            # Calculate completion rate
            completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
            
            course_progress_data.append({
                'course_id': course.id,
                'course_title': course.title,
                'total_enrollments': total_enrollments,
                'completed_enrollments': completed_enrollments,
                'avg_progress': round(avg_progress, 1),
                'completion_rate': round(completion_rate, 1),
                'recent_updates': len(recent_updates),
                'instructor': course.instructor.name if course.instructor else 'Unknown'
            })
        
        # Sort by total enrollments (most popular first)
        course_progress_data.sort(key=lambda x: x['total_enrollments'], reverse=True)
        
        return jsonify({
            'courses': course_progress_data,
            'total_courses': len(course_progress_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/progress-trends', methods=['GET'])
@jwt_required()
def get_progress_trends():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get progress trends for the last 7 days
        progress_trends = []
        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # Count enrollments for this day
            daily_enrollments = Enrollment.query.filter(
                Enrollment.enrolled_at >= start_of_day,
                Enrollment.enrolled_at <= end_of_day
            ).count()
            
            # Count completions for this day
            daily_completions = Enrollment.query.filter(
                Enrollment.completed_at >= start_of_day,
                Enrollment.completed_at <= end_of_day
            ).count()
            
            progress_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'enrollments': daily_enrollments,
                'completions': daily_completions
            })
        
        return jsonify({
            'trends': list(reversed(progress_trends))
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        activities = UserActivity.query.order_by(
            UserActivity.created_at.desc()
        ).limit(20).all()
        
        return jsonify([activity.to_dict() for activity in activities]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# File serving route
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Additional CORS handling for preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'message': 'OK'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'KnowledgeNest API is running',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# Initialize database
def create_tables():
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        admin = User.query.filter_by(email='admin@knowledgenest.com').first()
        if not admin:
            admin = User(
                name='Admin',
                email='admin@knowledgenest.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

if __name__ == '__main__':
    create_tables()
    app.run(debug=True, host='0.0.0.0', port=5004)
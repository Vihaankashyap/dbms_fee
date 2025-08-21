// API Configuration
const API_BASE_URL = 'http://localhost:5004/api';

// API Client Class
class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('access_token');
    }

    // Helper method to make HTTP requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        const response = await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.access_token) {
            this.setToken(response.access_token);
        }

        return response;
    }

    async login(credentials) {
        const response = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.access_token) {
            this.setToken(response.access_token);
        }

        return response;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('access_token', token);
    }

    // User profile methods
    async getProfile() {
        return await this.request('/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async uploadProfileImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        return await this.request('/upload-profile-image', {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData
        });
    }

    // Course methods
    async getCourses(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/courses?${queryString}` : '/courses';
        return await this.request(endpoint);
    }

    async getCourse(courseId) {
        return await this.request(`/courses/${courseId}`);
    }

    async enrollCourse(courseId) {
        return await this.request('/enroll', {
            method: 'POST',
            body: JSON.stringify({ course_id: courseId })
        });
    }

    async getMyCourses() {
        return await this.request('/my-courses');
    }

    // Analytics methods (admin only)
    async getAnalyticsOverview() {
        return await this.request('/analytics/overview');
    }

    async getRecentActivity() {
        return await this.request('/analytics/activity');
    }

    async getRealTimeAnalytics() {
        return await this.request('/analytics/real-time');
    }

    async getUsersAnalytics() {
        return await this.request('/analytics/users');
    }

    async getCourseProgressAnalytics() {
        return await this.request('/analytics/course-progress');
    }

    async getProgressTrends() {
        return await this.request('/analytics/progress-trends');
    }
}

// Create global API client instance
const api = new APIClient();

// Utility functions for UI
class UIHelpers {
    static showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        // Style the message
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(messageDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    static showLoading(show = true) {
        let loader = document.getElementById('global-loader');

        if (show && !loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;

            const spinner = loader.querySelector('.spinner');
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            `;

            // Add CSS animation
            if (!document.getElementById('spinner-style')) {
                const style = document.createElement('style');
                style.id = 'spinner-style';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(loader);
        } else if (!show && loader) {
            loader.remove();
        }
    }

    static isLoggedIn() {
        return !!localStorage.getItem('access_token');
    }

    static getCurrentUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    static saveUserData(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    static redirectToLogin() {
        window.location.href = 'login.html';
    }

    static redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, UIHelpers };
}
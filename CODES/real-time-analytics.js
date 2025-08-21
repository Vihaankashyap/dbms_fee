// Real-time Analytics System
class RealTimeAnalytics {
    constructor() {
        this.updateInterval = 5000; // 5 seconds
        this.charts = {};
        this.lastUpdateTime = null;
        this.isUpdating = false;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Real-time Analytics...');

        // Check authentication
        if (!UIHelpers.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        const user = UIHelpers.getCurrentUser();
        if (user.role !== 'admin') {
            UIHelpers.showMessage('Access denied. Admin privileges required.', 'error');
            setTimeout(() => window.location.href = 'home.html', 2000);
            return;
        }

        // Initialize charts
        this.initializeCharts();

        // Load initial data
        await this.loadAllData();

        // Start real-time updates
        this.startRealTimeUpdates();

        console.log('✅ Real-time Analytics initialized');

        // Initialize course progress analytics
        setTimeout(() => {
            this.courseProgress = new CourseProgressAnalytics(this);
        }, 500);
    }

    initializeCharts() {
        // Course Progress Chart
        const ctx = document.getElementById('progressChart').getContext('2d');
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'New Enrollments',
                        data: [],
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.4
                    },
                    {
                        label: 'Course Completions',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    async loadAllData() {
        this.isUpdating = true;

        try {
            // Load statistics
            await this.loadStatistics();

            // Load charts data
            await this.loadChartsData();

            // Load activity feed
            await this.loadActivityFeed();

            // Load user table
            await this.loadUserTable();

            this.lastUpdateTime = new Date();

        } catch (error) {
            console.error('❌ Error loading analytics data:', error);
            UIHelpers.showMessage('Failed to load analytics data', 'error');
        } finally {
            this.isUpdating = false;
        }
    }

    async loadStatistics() {
        try {
            const response = await api.getRealTimeAnalytics();

            // Update statistics cards
            document.getElementById('totalUsers').textContent = response.total_users || 0;
            document.getElementById('totalCourses').textContent = response.total_courses || 0;
            document.getElementById('totalEnrollments').textContent = response.total_enrollments || 0;
            document.getElementById('activeUsers').textContent = response.active_users_today || 0;

            // Update trends (mock data for now)
            this.updateTrends(response);

            // Update charts with real data
            if (response.registration_trends) {
                this.updateRegistrationChart(response.registration_trends);
            }

        } catch (error) {
            console.error('Error loading statistics:', error);
            // Use fallback data
            this.loadFallbackStats();
        }
    }

    updateRegistrationChart(trends) {
        const labels = trends.map(trend => {
            const date = new Date(trend.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const data = trends.map(trend => trend.registrations);

        this.charts.registration.data.labels = labels;
        this.charts.registration.data.datasets[0].data = data;
        this.charts.registration.update();
    }

    loadFallbackStats() {
        // Fallback statistics if API fails
        document.getElementById('totalUsers').textContent = '6';
        document.getElementById('totalCourses').textContent = '3';
        document.getElementById('totalEnrollments').textContent = '12';
        document.getElementById('activeUsers').textContent = '4';
    }

    updateTrends(data) {
        // Calculate trends (simplified)
        const trends = {
            users: Math.floor(Math.random() * 20) + 5,
            courses: Math.floor(Math.random() * 15) + 3,
            enrollments: Math.floor(Math.random() * 30) + 10,
            active: Math.floor(Math.random() * 10) + 2
        };

        document.getElementById('usersTrend').textContent = `+${trends.users}%`;
        document.getElementById('coursesTrend').textContent = `+${trends.courses}%`;
        document.getElementById('enrollmentsTrend').textContent = `+${trends.enrollments}%`;
        document.getElementById('activeTrend').textContent = `+${trends.active}%`;
    }

    async loadChartsData() {
        try {
            // Generate registration data for the last 7 days
            const labels = [];
            const data = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

                // Mock data - in real implementation, this would come from database
                data.push(Math.floor(Math.random() * 5) + 1);
            }

            this.charts.registration.data.labels = labels;
            this.charts.registration.data.datasets[0].data = data;
            this.charts.registration.update();

        } catch (error) {
            console.error('Error loading charts data:', error);
        }
    }

    async loadActivityFeed() {
        try {
            const response = await api.getRecentActivity();
            const activities = response.activities || [];

            const feedContainer = document.getElementById('activityFeed');
            feedContainer.innerHTML = '';

            if (activities.length === 0) {
                // Generate mock activities if none exist
                this.generateMockActivities(feedContainer);
            } else {
                activities.forEach(activity => {
                    const activityElement = this.createActivityElement(activity);
                    feedContainer.appendChild(activityElement);
                });
            }

        } catch (error) {
            console.error('Error loading activity feed:', error);
            this.generateMockActivities(document.getElementById('activityFeed'));
        }
    }

    generateMockActivities(container) {
        const mockActivities = [
            {
                action_type: 'login',
                description: 'Aayushman logged in',
                created_at: new Date(Date.now() - 300000).toISOString() // 5 min ago
            },
            {
                action_type: 'register',
                description: 'New user Vihaan registered',
                created_at: new Date(Date.now() - 1800000).toISOString() // 30 min ago
            },
            {
                action_type: 'enrollment',
                description: 'Jane enrolled in Web Development',
                created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            },
            {
                action_type: 'completion',
                description: 'John completed JavaScript course',
                created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
            }
        ];

        container.innerHTML = '';
        mockActivities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            container.appendChild(activityElement);
        });
    }

    createActivityElement(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const iconClass = this.getActivityIconClass(activity.action_type);
        const icon = this.getActivityIcon(activity.action_type);
        const timeAgo = this.formatTimeAgo(activity.created_at);

        item.innerHTML = `
            <div class="activity-icon ${iconClass}">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;

        return item;
    }

    getActivityIconClass(actionType) {
        const classes = {
            'login': 'activity-login',
            'register': 'activity-register',
            'enrollment': 'activity-enrollment',
            'completion': 'activity-completion'
        };
        return classes[actionType] || 'activity-login';
    }

    getActivityIcon(actionType) {
        const icons = {
            'login': 'fas fa-sign-in-alt',
            'register': 'fas fa-user-plus',
            'enrollment': 'fas fa-graduation-cap',
            'completion': 'fas fa-trophy'
        };
        return icons[actionType] || 'fas fa-circle';
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }

    async loadUserTable() {
        try {
            const response = await api.getUsersAnalytics();
            const users = response.users || [];

            const tableBody = document.getElementById('userTableBody');
            tableBody.innerHTML = '';

            if (users.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="6" style="text-align: center;">No users found</td>';
                tableBody.appendChild(row);
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status-badge status-${user.role}">${user.role}</span></td>
                    <td><span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error loading user table:', error);
            // Fallback to mock data
            this.loadFallbackUserTable();
        }
    }

    loadFallbackUserTable() {
        const users = [
            { id: 6, name: 'Aayushman', email: 'aayushman@knowledgenest.com', role: 'student', is_active: true, created_at: '2025-08-21T12:38:07' },
            { id: 5, name: 'Vihaan', email: 'vihaankashyap2005@gmail.com', role: 'student', is_active: true, created_at: '2025-08-13T07:45:29' },
            { id: 4, name: 'Test User', email: 'test@example.com', role: 'student', is_active: true, created_at: '2025-08-13T07:35:28' },
            { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'student', is_active: true, created_at: '2025-08-12T08:08:12' },
            { id: 2, name: 'John Doe', email: 'john@example.com', role: 'instructor', is_active: true, created_at: '2025-08-12T08:08:12' },
            { id: 1, name: 'Admin User', email: 'admin@knowledgenest.com', role: 'admin', is_active: true, created_at: '2025-08-12T08:08:12' }
        ];

        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge status-${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    startRealTimeUpdates() {
        setInterval(async () => {
            if (!this.isUpdating) {
                console.log('🔄 Updating analytics data...');
                await this.loadAllData();

                // Add new activity animation
                this.animateNewActivity();

                // Simulate course progress updates
                if (this.courseProgress) {
                    this.courseProgress.simulateProgressUpdate();
                }
            }
        }, this.updateInterval);

        console.log(`✅ Real-time updates started (every ${this.updateInterval / 1000}s)`);
    }

    animateNewActivity() {
        // Randomly add a new activity to simulate real-time updates
        if (Math.random() > 0.7) { // 30% chance
            const activities = [
                { action_type: 'login', description: 'User logged in' },
                { action_type: 'enrollment', description: 'New course enrollment' },
                { action_type: 'completion', description: 'Course completed' },
                { action_type: 'progress', description: 'Course progress updated' }
            ];

            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            randomActivity.created_at = new Date().toISOString();

            const feedContainer = document.getElementById('activityFeed');
            const newActivity = this.createActivityElement(randomActivity);
            newActivity.classList.add('new');

            feedContainer.insertBefore(newActivity, feedContainer.firstChild);

            // Remove oldest activity if more than 10
            if (feedContainer.children.length > 10) {
                feedContainer.removeChild(feedContainer.lastChild);
            }
        }
    }
}

// Global functions for refresh buttons
window.refreshCharts = async function () {
    if (window.analytics) {
        await window.analytics.loadChartsData();
        UIHelpers.showMessage('Charts refreshed!', 'success');
    }
};

window.refreshUserTable = async function () {
    if (window.analytics) {
        await window.analytics.loadUserTable();
        UIHelpers.showMessage('User table refreshed!', 'success');
    }
};

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new RealTimeAnalytics();
});
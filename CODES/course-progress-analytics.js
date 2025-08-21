// Course Progress Analytics Extension
class CourseProgressAnalytics {
    constructor(parentAnalytics) {
        this.parent = parentAnalytics;
    }
    
    async loadCourseProgress() {
        try {
            const response = await api.getCourseProgressAnalytics();
            const courses = response.courses || [];
            
            this.renderCourseProgressGrid(courses);
            this.updateProgressStatistics(courses);
            
        } catch (error) {
            console.error('Error loading course progress:', error);
            this.renderMockCourseProgress();
        }
    }
    
    renderCourseProgressGrid(courses) {
        const gridContainer = document.getElementById('courseProgressGrid');
        
        if (courses.length === 0) {
            gridContainer.innerHTML = '<div style="text-align: center; padding: 2rem;">No course data available</div>';
            return;
        }
        
        gridContainer.innerHTML = '';
        
        courses.forEach(course => {
            const courseCard = this.createCourseProgressCard(course);
            gridContainer.appendChild(courseCard);
        });
    }
    
    createCourseProgressCard(course) {
        const card = document.createElement('div');
        card.className = 'course-progress-card';
        card.id = `course-${course.course_id}`;
        
        const progressPercentage = course.avg_progress || 0;
        const completionRate = course.completion_rate || 0;
        
        card.innerHTML = `
            <div class="course-progress-header">
                <div class="course-title">${course.course_title}</div>
                <div class="enrollment-count">${course.total_enrollments} enrolled</div>
            </div>
            
            <div class="progress-overview">
                <div class="progress-stat">
                    <span>Average Progress:</span>
                    <span><strong>${progressPercentage}%</strong></span>
                </div>
                <div class="progress-stat">
                    <span>Completion Rate:</span>
                    <span><strong>${completionRate}%</strong></span>
                </div>
                <div class="progress-stat">
                    <span>Completed:</span>
                    <span><strong>${course.completed_enrollments}/${course.total_enrollments}</strong></span>
                </div>
            </div>
            
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
            </div>
            
            <div class="recent-progress">
                <i class="fas fa-clock"></i> ${course.recent_updates} updates in last 24h
                <br>
                <i class="fas fa-user-tie"></i> Instructor: ${course.instructor}
            </div>
        `;
        
        return card;
    }
    
    updateProgressStatistics(courses) {
        if (courses.length === 0) return;
        
        // Calculate total completions
        const totalCompletions = courses.reduce((sum, course) => sum + course.completed_enrollments, 0);
        const totalCompletionsElement = document.getElementById('totalCompletions');
        if (totalCompletionsElement) {
            totalCompletionsElement.textContent = totalCompletions;
        }
        
        // Calculate average progress across all courses
        const totalProgress = courses.reduce((sum, course) => sum + (course.avg_progress * course.total_enrollments), 0);
        const totalEnrollments = courses.reduce((sum, course) => sum + course.total_enrollments, 0);
        const avgProgress = totalEnrollments > 0 ? (totalProgress / totalEnrollments) : 0;
        
        const avgProgressElement = document.getElementById('avgProgress');
        if (avgProgressElement) {
            avgProgressElement.textContent = `${Math.round(avgProgress)}%`;
        }
    }
    
    renderMockCourseProgress() {
        const mockCourses = [
            {
                course_id: 1,
                course_title: 'Complete Web Development Bootcamp',
                total_enrollments: 45,
                completed_enrollments: 12,
                avg_progress: 67.5,
                completion_rate: 26.7,
                recent_updates: 8,
                instructor: 'John Doe'
            },
            {
                course_id: 2,
                course_title: 'JavaScript Mastery Course',
                total_enrollments: 32,
                completed_enrollments: 18,
                avg_progress: 78.2,
                completion_rate: 56.3,
                recent_updates: 5,
                instructor: 'Jane Smith'
            },
            {
                course_id: 3,
                course_title: 'Python for Data Science',
                total_enrollments: 28,
                completed_enrollments: 7,
                avg_progress: 45.8,
                completion_rate: 25.0,
                recent_updates: 12,
                instructor: 'Mike Johnson'
            }
        ];
        
        this.renderCourseProgressGrid(mockCourses);
        this.updateProgressStatistics(mockCourses);
    }
    
    async simulateProgressUpdate() {
        // Simulate real-time progress updates
        const courseCards = document.querySelectorAll('.course-progress-card');
        
        courseCards.forEach(card => {
            if (Math.random() > 0.8) { // 20% chance of update
                // Add update animation
                card.classList.add('progress-update');
                
                // Update progress bar slightly
                const progressBar = card.querySelector('.progress-bar-fill');
                const currentWidth = parseFloat(progressBar.style.width) || 0;
                const newWidth = Math.min(100, currentWidth + Math.random() * 2);
                progressBar.style.width = `${newWidth}%`;
                
                // Update progress text
                const progressStat = card.querySelector('.progress-stat span:last-child');
                if (progressStat) {
                    progressStat.innerHTML = `<strong>${Math.round(newWidth)}%</strong>`;
                }
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    card.classList.remove('progress-update');
                }, 1000);
            }
        });
    }
    
    async loadProgressTrends() {
        try {
            const response = await api.getProgressTrends();
            const trends = response.trends || [];
            
            this.updateProgressChart(trends);
            
        } catch (error) {
            console.error('Error loading progress trends:', error);
            this.loadMockProgressTrends();
        }
    }
    
    updateProgressChart(trends) {
        if (!this.parent.charts.progress) return;
        
        const labels = trends.map(trend => {
            const date = new Date(trend.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const enrollmentData = trends.map(trend => trend.enrollments);
        const completionData = trends.map(trend => trend.completions);
        
        this.parent.charts.progress.data.labels = labels;
        this.parent.charts.progress.data.datasets[0].data = enrollmentData;
        this.parent.charts.progress.data.datasets[1].data = completionData;
        this.parent.charts.progress.update();
    }
    
    loadMockProgressTrends() {
        const labels = [];
        const enrollmentData = [];
        const completionData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            enrollmentData.push(Math.floor(Math.random() * 8) + 2);
            completionData.push(Math.floor(Math.random() * 4) + 1);
        }
        
        if (this.parent.charts.progress) {
            this.parent.charts.progress.data.labels = labels;
            this.parent.charts.progress.data.datasets[0].data = enrollmentData;
            this.parent.charts.progress.data.datasets[1].data = completionData;
            this.parent.charts.progress.update();
        }
    }
}

// Global function for refresh button
window.refreshCourseProgress = async function() {
    if (window.analytics && window.analytics.courseProgress) {
        await window.analytics.courseProgress.loadCourseProgress();
        UIHelpers.showMessage('Course progress refreshed!', 'success');
    }
};
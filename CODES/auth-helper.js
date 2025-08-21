// Authentication Helper Functions
class AuthHelper {
    static updateUserDisplay() {
        const user = UIHelpers.getCurrentUser();
        const isLoggedIn = UIHelpers.isLoggedIn();
        
        // Update header profile
        this.updateHeaderProfile(user, isLoggedIn);
        
        // Update sidebar profile
        this.updateSidebarProfile(user, isLoggedIn);
        
        // Update navigation buttons
        this.updateNavigationButtons(user, isLoggedIn);
    }
    
    static updateHeaderProfile(user, isLoggedIn) {
        const headerImage = document.getElementById('headerProfileImage');
        const headerName = document.getElementById('headerProfileName');
        const headerRole = document.getElementById('headerProfileRole');
        
        if (isLoggedIn && user) {
            if (headerImage) {
                headerImage.src = user.profile_image || 'images/pic-1.jpg';
                headerImage.alt = user.name || 'User';
            }
            if (headerName) {
                headerName.textContent = user.name || 'User';
            }
            if (headerRole) {
                headerRole.textContent = user.role || 'student';
            }
        } else {
            if (headerImage) {
                headerImage.src = 'images/pic-1.jpg';
                headerImage.alt = 'Guest';
            }
            if (headerName) {
                headerName.textContent = 'Guest';
            }
            if (headerRole) {
                headerRole.textContent = 'visitor';
            }
        }
    }
    
    static updateSidebarProfile(user, isLoggedIn) {
        const sidebarImages = document.querySelectorAll('.side-bar .profile .image');
        const sidebarNames = document.querySelectorAll('.side-bar .profile .name');
        const sidebarRoles = document.querySelectorAll('.side-bar .profile .role');
        
        if (isLoggedIn && user) {
            sidebarImages.forEach(img => {
                img.src = user.profile_image || 'images/pic-1.jpg';
                img.alt = user.name || 'User';
            });
            sidebarNames.forEach(name => {
                name.textContent = user.name || 'User';
            });
            sidebarRoles.forEach(role => {
                role.textContent = user.role || 'student';
            });
        } else {
            sidebarImages.forEach(img => {
                img.src = 'images/pic-1.jpg';
                img.alt = 'Guest';
            });
            sidebarNames.forEach(name => {
                name.textContent = 'Guest User';
            });
            sidebarRoles.forEach(role => {
                role.textContent = 'visitor';
            });
        }
    }
    
    static updateNavigationButtons(user, isLoggedIn) {
        const flexBtnContainer = document.querySelector('.profile .flex-btn');
        
        if (flexBtnContainer) {
            if (isLoggedIn && user) {
                let buttonsHTML = `<a href="profile.html" class="option-btn">profile</a>`;
                
                // Add analytics link for admin users
                if (user.role === 'admin') {
                    buttonsHTML += `<a href="analytics-dashboard.html" class="option-btn">analytics</a>`;
                }
                
                buttonsHTML += `<a href="#" class="option-btn" onclick="AuthHelper.logout()">logout</a>`;
                
                flexBtnContainer.innerHTML = buttonsHTML;
            } else {
                flexBtnContainer.innerHTML = `
                    <a href="login.html" class="option-btn">login</a>
                    <a href="register.html" class="option-btn">register</a>
                `;
            }
        }
    }
    
    static logout() {
        if (confirm('Are you sure you want to logout?')) {
            api.logout();
            UIHelpers.showMessage('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        }
    }
    
    static checkAuthAndRedirect() {
        const user = UIHelpers.getCurrentUser();
        const isLoggedIn = UIHelpers.isLoggedIn();
        
        if (isLoggedIn && user) {
            // If user is admin and on login/register page, redirect to dashboard
            if (user.role === 'admin' && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
                window.location.href = 'dashboard.html';
                return;
            }
            
            // If regular user on login/register page, redirect to home
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
                window.location.href = 'home.html';
                return;
            }
        }
    }
    
    static initializeAuth() {
        // Validate user data first
        if (!this.validateAuthData()) {
            return;
        }
        
        // Update user display on page load
        this.updateUserDisplay();
        
        // Check authentication and redirect if needed
        this.checkAuthAndRedirect();
    }
    
    static validateAuthData() {
        const userData = localStorage.getItem('user_data');
        const token = localStorage.getItem('access_token');
        
        // If no user data, that's fine (guest user)
        if (!userData) {
            return true;
        }
        
        // If user data exists but no token, clear invalid data
        if (userData && !token) {
            console.warn('User data exists but no token found - clearing invalid data');
            this.clearInvalidAuth();
            return false;
        }
        
        // Validate user data structure
        try {
            const user = JSON.parse(userData);
            if (!user.id || !user.email) {
                console.warn('Invalid user data structure - clearing');
                this.clearInvalidAuth();
                return false;
            }
        } catch (error) {
            console.warn('Corrupted user data - clearing');
            this.clearInvalidAuth();
            return false;
        }
        
        return true;
    }
    
    static clearInvalidAuth() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_data');
        
        // Update display to show guest user
        this.updateUserDisplay();
        
        // Show message if UIHelpers is available
        if (typeof UIHelpers !== 'undefined') {
            UIHelpers.showMessage('Invalid session data cleared. Please login again.', 'warning');
        }
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        AuthHelper.initializeAuth();
    }, 100);
});

// Update user display when storage changes (for cross-tab updates)
window.addEventListener('storage', (e) => {
    if (e.key === 'user_data' || e.key === 'access_token') {
        AuthHelper.updateUserDisplay();
    }
});

// Make AuthHelper available globally
window.AuthHelper = AuthHelper;
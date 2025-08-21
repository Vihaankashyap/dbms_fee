// Clear Authentication Data Script
function clearAllAuthData() {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Clear sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_data');
    
    // Clear any cookies (if any)
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('All authentication data cleared');
    
    // Show success message
    if (typeof UIHelpers !== 'undefined') {
        UIHelpers.showMessage('Authentication data cleared. Please login again.', 'success');
    }
    
    // Redirect to login after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Auto-clear if user data is invalid
function validateUserData() {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    
    if (userData && !token) {
        console.warn('User data exists but no token found - clearing invalid data');
        clearAllAuthData();
        return false;
    }
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (!user.id || !user.email) {
                console.warn('Invalid user data structure - clearing');
                clearAllAuthData();
                return false;
            }
        } catch (error) {
            console.warn('Corrupted user data - clearing');
            clearAllAuthData();
            return false;
        }
    }
    
    return true;
}

// Make functions available globally
window.clearAllAuthData = clearAllAuthData;
window.validateUserData = validateUserData;
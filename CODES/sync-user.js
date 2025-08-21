// Sync Frontend User with Database
class UserSync {
    static async syncCurrentUser() {
        const userData = localStorage.getItem('user_data');
        
        if (!userData) {
            console.log('No user data to sync');
            return false;
        }
        
        try {
            const user = JSON.parse(userData);
            console.log('Syncing user:', user);
            
            // Check if user exists in database
            const exists = await this.checkUserExists(user.email);
            
            if (!exists) {
                // Register user in database
                await this.registerUserInDB(user);
                console.log('✅ User synced to database');
                return true;
            } else {
                console.log('✅ User already exists in database');
                return true;
            }
        } catch (error) {
            console.error('❌ Sync failed:', error);
            return false;
        }
    }
    
    static async checkUserExists(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/check-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking user:', error);
            return false;
        }
    }
    
    static async registerUserInDB(user) {
        try {
            // Create a default password for the sync
            const defaultPassword = 'TempPass123!';
            
            const response = await api.register({
                name: user.name,
                email: user.email || `${user.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
                password: defaultPassword
            });
            
            // Update localStorage with proper user data
            UIHelpers.saveUserData(response.user);
            
            // Show success message
            if (typeof UIHelpers !== 'undefined') {
                UIHelpers.showMessage(`Welcome ${user.name}! Your account has been created. Default password: ${defaultPassword}`, 'success');
            }
            
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }
    
    static createUserFromFrontend(name, email = null) {
        const userData = {
            name: name,
            email: email || `${name.toLowerCase().replace(/\s+/g, '')}@knowledgenest.com`,
            role: 'student',
            id: Date.now(), // Temporary ID
            created_at: new Date().toISOString()
        };
        
        UIHelpers.saveUserData(userData);
        return userData;
    }
}

// Auto-sync on page load
document.addEventListener('DOMContentLoaded', async () => {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    
    // If we have user data but no token, try to sync
    if (userData && !token) {
        console.log('🔄 Attempting to sync user with database...');
        
        try {
            const user = JSON.parse(userData);
            
            // If it's the "Aayushman" user, let's login them properly
            if (user.name === 'Aayushman' || user.name === 'aayushman') {
                console.log('🔑 Auto-logging in Aayushman...');
                
                try {
                    // Try to login with default credentials
                    const response = await api.login({
                        email: 'aayushman@knowledgenest.com',
                        password: 'aayushman123'
                    });
                    
                    console.log('✅ Aayushman logged in successfully');
                    
                    // Update the display
                    if (typeof AuthHelper !== 'undefined') {
                        AuthHelper.updateUserDisplay();
                    }
                    
                } catch (loginError) {
                    console.log('⚠️ Auto-login failed, user needs to login manually');
                    
                    // Update user data with database info
                    const updatedUser = {
                        ...user,
                        email: 'aayushman@knowledgenest.com',
                        id: 6,
                        role: 'student'
                    };
                    
                    UIHelpers.saveUserData(updatedUser);
                    
                    if (typeof UIHelpers !== 'undefined') {
                        UIHelpers.showMessage('Please login with: aayushman@knowledgenest.com / aayushman123', 'info');
                    }
                }
            } else {
                await UserSync.syncCurrentUser();
            }
        } catch (error) {
            console.error('Auto-sync failed:', error);
        }
    }
});

// Make available globally
window.UserSync = UserSync;
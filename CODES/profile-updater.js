// Profile Update Helper
class ProfileUpdater {
    static async refreshUserProfile() {
        try {
            if (UIHelpers.isLoggedIn()) {
                const profile = await api.getProfile();
                UIHelpers.saveUserData(profile.user);
                AuthHelper.updateUserDisplay();
            }
        } catch (error) {
            console.error('Failed to refresh user profile:', error);
        }
    }
    
    static async handleProfileImageUpload(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            UIHelpers.showMessage('Please select a valid image file', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            UIHelpers.showMessage('Image size should be less than 5MB', 'error');
            return;
        }
        
        try {
            UIHelpers.showLoading(true);
            await api.uploadProfileImage(file);
            await this.refreshUserProfile();
            UIHelpers.showMessage('Profile image updated successfully!', 'success');
        } catch (error) {
            UIHelpers.showMessage(error.message || 'Failed to upload image', 'error');
        } finally {
            UIHelpers.showLoading(false);
        }
    }
    
    static previewImage(input, previewElement) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewElement.src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
}

// Auto-refresh profile on page focus (in case it was updated in another tab)
window.addEventListener('focus', () => {
    ProfileUpdater.refreshUserProfile();
});

// Make ProfileUpdater available globally
window.ProfileUpdater = ProfileUpdater;
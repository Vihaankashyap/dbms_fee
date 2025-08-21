// Clean Start Script for KnowledgeNest
// This ensures every page load starts with a clean state

(function() {
    'use strict';
    
    console.log('CleanStart: Initializing fresh session...');
    
    // Clear all stored user data immediately
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('lastServerCheck');
    sessionStorage.clear();
    
    // Set all profile displays to default state immediately
    function setDefaultProfileState() {
        // Update all profile images
        const profileImages = document.querySelectorAll('.profile .image, .profile img');
        profileImages.forEach(img => {
            img.src = 'images/pic-1.jpg';
            img.alt = 'Guest';
        });
        
        // Update all profile names
        const profileNames = document.querySelectorAll('.profile .name');
        profileNames.forEach(name => {
            name.textContent = 'Guest';
        });
        
        // Update all profile roles
        const profileRoles = document.querySelectorAll('.profile .role');
        profileRoles.forEach(role => {
            role.textContent = 'visitor';
        });
        
        // Update specific elements if they exist
        const elements = [
            'headerProfileName', 'headerProfileRole', 'sidebarProfileName', 'sidebarProfileRole',
            'userName', 'userRole', 'headerProfileImage', 'sidebarProfileImage', 'profileImage'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'IMG') {
                    element.src = 'images/pic-1.jpg';
                    element.alt = 'Guest';
                } else {
                    if (id.includes('Name')) element.textContent = 'Guest';
                    if (id.includes('Role')) element.textContent = 'visitor';
                }
            }
        });
    }
    
    // Set default state immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setDefaultProfileState);
    } else {
        setDefaultProfileState();
    }
    
    // Also set default state after a short delay to catch any dynamic content
    setTimeout(setDefaultProfileState, 100);
    
    console.log('CleanStart: Fresh session initialized');
})();
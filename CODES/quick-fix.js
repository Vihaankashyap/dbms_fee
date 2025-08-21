// Quick Authentication Fix
(function() {
    console.log('🔧 Running Quick Authentication Fix...');
    
    // Clear all authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Authentication data cleared');
    
    // Force reload to reset state
    setTimeout(() => {
        window.location.reload();
    }, 500);
})();
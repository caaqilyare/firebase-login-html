// Initialize components of the application
function initializeComponents() {
    // Components will be loaded by auth.js based on authentication state
    console.log('Components initialized');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeComponents();
        initializeAuth();
        initializeTheme();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
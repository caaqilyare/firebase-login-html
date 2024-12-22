// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeComponents();
    initializeAuth();
    initializeTheme();
    
    // Load dashboard content
    fetch('components/dashboard.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('dashboard-content').innerHTML = html;
        })
        .catch(error => console.error('Error loading dashboard:', error));
});
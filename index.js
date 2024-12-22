// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeComponents();
        initializeAuth();
        initializeTheme();
        
        // Initialize Firebase Auth state observer
        firebase.auth().onAuthStateChanged((user) => {
            const userEmail = document.getElementById('userEmail');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (user) {
                // User is signed in
                userEmail.textContent = user.email;
                
                // Setup logout functionality
                logoutBtn.addEventListener('click', () => {
                    firebase.auth().signOut().then(() => {
                        // Sign-out successful, redirect to login page
                        window.location.href = '/login.html';
                    }).catch((error) => {
                        console.error('Logout error:', error);
                    });
                });
            } else {
                // No user is signed in, redirect to login page
                window.location.href = '/login.html';
            }
        });

        // Load dashboard content
        const dashboardContent = document.getElementById('dashboard-content');
        if (!dashboardContent) {
            console.error('Dashboard content element not found');
            return;
        }

        fetch('components/dashboard.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                dashboardContent.innerHTML = html;
                // After loading content, initialize any necessary event listeners
                initializeEventListeners();
            })
            .catch(error => {
                console.error('Error loading dashboard:', error);
                dashboardContent.innerHTML = '<p class="text-red-500">Error loading dashboard content</p>';
            });
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

function initializeEventListeners() {
    // Add any necessary event listeners here after content is loaded
    document.querySelectorAll('[data-action]').forEach(element => {
        if (element && element.dataset.action) {
            element.addEventListener('click', (e) => {
                // Handle the action safely
                try {
                    const action = element.dataset.action;
                    console.log(`Handling action: ${action}`);
                    // Add your action handling logic here
                } catch (error) {
                    console.error('Error handling action:', error);
                }
            });
        }
    });
}
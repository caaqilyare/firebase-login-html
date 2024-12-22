// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeComponents();
        initializeAuth();
        initializeTheme();
        setupUserInterface();
        
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

function setupUserInterface() {
    const userEmailElement = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');

    // Set up auth state listener
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            userEmailElement.textContent = user.email;
        } else {
            // User is signed out
            window.location.href = '/login.html';
        }
    });

    // Set up logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            firebase.auth().signOut().then(() => {
                // Sign-out successful, redirect will happen automatically
                // due to the auth state listener above
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });
    }
}

function initializeEventListeners() {
    // Add any necessary event listeners here after content is loaded
    document.querySelectorAll('[data-action]').forEach(element => {
        if (element && element.dataset.action) {
            element.addEventListener('click', (e) => {
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
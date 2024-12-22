// Initialize Firebase Authentication
function initializeAuth() {
    // Check if user is already signed in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            // Load dashboard content
            loadDashboard();
        } else {
            // No user is signed in, show login
            console.log('No user signed in');
            loadLogin();
        }
    });
}

// Load login component
function loadLogin() {
    fetch('components/login.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('components-container').innerHTML = html;
            // Add event listener to login form
            document.getElementById('login_form').addEventListener('submit', handleLogin);
        })
        .catch(error => console.error('Error loading login:', error));
}

// Load dashboard component
function loadDashboard() {
    fetch('components/dashboard.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('components-container').innerHTML = html;
            // Show the dashboard by removing hidden class
            const dashboard = document.getElementById('user_div');
            if (dashboard) {
                dashboard.classList.remove('hidden');
                // Initialize dashboard functionality
                initializeDashboard();
            }
            // Add logout handler
            const logoutButton = document.querySelector('button[onclick="logout()"]');
            if (logoutButton) {
                logoutButton.onclick = handleLogout;
            }
        })
        .catch(error => console.error('Error loading dashboard:', error));
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email_field').value;
    const password = document.getElementById('password_field').value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log('Logged in successfully:', user.email);
        })
        .catch((error) => {
            console.error('Login error:', error);
            // Show error message to user
            alert(error.message);
        });
}

// Handle logout
function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Logged out successfully');
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
}

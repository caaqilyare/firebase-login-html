// Firebase Authentication State Observer
let currentUser = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function initializeAuth() {
    // Initialize Firebase Authentication and get a reference to the service
    auth = firebase.auth();
    
    // Set up authentication state observer
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            handleAuthenticatedUser();
        } else {
            currentUser = null;
            handleUnauthenticatedUser();
        }
    });

    // Set up login form listener if it exists
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleAuthenticatedUser() {
    const authElements = document.querySelectorAll('.auth-required');
    const unauthElements = document.querySelectorAll('.unauth-required');

    authElements.forEach(element => {
        if (element && element.classList) {
            element.classList.remove('hidden');
        }
    });

    unauthElements.forEach(element => {
        if (element && element.classList) {
            element.classList.add('hidden');
        }
    });
}

function handleUnauthenticatedUser() {
    const authElements = document.querySelectorAll('.auth-required');
    const unauthElements = document.querySelectorAll('.unauth-required');

    authElements.forEach(element => {
        if (element && element.classList) {
            element.classList.add('hidden');
        }
    });

    unauthElements.forEach(element => {
        if (element && element.classList) {
            element.classList.remove('hidden');
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        console.error('Email and password are required');
        return;
    }

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Login error:', error.message);
    }
}

function logout() {
    firebase.auth().signOut().catch((error) => {
        console.error('Logout error:', error);
    });
}

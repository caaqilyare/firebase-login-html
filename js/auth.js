import { loadUserData } from './items.js';

// Firebase Authentication functions
export function login() {
    const email = document.getElementById("email_field").value;
    const password = document.getElementById("password_field").value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch((error) => {
            const errorMessage = error.message;
            alert("Error : " + errorMessage);
        });
}

export function logout() {
    firebase.auth().signOut();
}

// Auth state observer
export function initializeAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("user_div").classList.remove("hidden");
            document.getElementById("login_div").classList.add("hidden");
            loadUserData();
        } else {
            document.getElementById("user_div").classList.add("hidden");
            document.getElementById("login_div").classList.remove("hidden");
        }
    });
}

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB30ptiCR7QpX90pzIXZU3OsZEgQp8sW5w",
    authDomain: "fir-login-6605c.firebaseapp.com",
    databaseURL: "https://fir-login-6605c.firebaseio.com",
    projectId: "fir-login-6605c",
    storageBucket: "fir-login-6605c.appspot.com",
    messagingSenderId: "581631828835"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Configure Firestore settings
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

// Global state
const appState = {
    currentItemType: 'note',
    currentEditId: null
};

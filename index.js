var config = {
  apiKey: "AIzaSyB30ptiCR7QpX90pzIXZU3OsZEgQp8sW5w",
  authDomain: "fir-login-6605c.firebaseapp.com",
  databaseURL: "https://fir-login-6605c.firebaseio.com",
  projectId: "fir-login-6605c",
  storageBucket: "fir-login-6605c.appspot.com",
  messagingSenderId: "581631828835"
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.

    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    var user = firebase.auth().currentUser;

    if(user != null){

      var email_id = user.email;
      document.getElementById("user_para").innerHTML = "Kusoo Dhawoow  : " + email_id;

    }

  } else {
    // No user is signed in.

    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }
});

function login(){

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    window.alert("Error : " + errorMessage);

    // ...
  });

}

function logout(){
  firebase.auth().signOut();
}

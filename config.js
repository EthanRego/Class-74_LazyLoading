import firebase from 'firebase'
require('@firebase/firestore')
// Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBMaqDmUvjT4l5VVtbgp1RzUlVW1YW5UuE",
    authDomain: "willy-3e7df.firebaseapp.com",
    projectId: "willy-3e7df",
    databaseURL:"https://willy-3e7df.firebaseio.com",
    storageBucket: "willy-3e7df.appspot.com",
    messagingSenderId: "159510526322",
    appId: "1:159510526322:web:be27241ef38b5f9dac85eb"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()
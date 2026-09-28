/* js/firebase-config.js */
const firebaseConfig = {
  apiKey: "AIzaSyDQ7GZ0-mB2xHScDKMjlDyRXLg6s9BqRXY",
  authDomain: "new-kdrama-quiz.firebaseapp.com",
  projectId: "new-kdrama-quiz",
  storageBucket: "new-kdrama-quiz.firebasestorage.app",
  messagingSenderId: "655215728523",
  appId: "1:655215728523:web:85e9eb644147bd8d45018e",
  measurementId: "G-WFY7NJV4YF"
};

if(typeof firebase === 'undefined'){
  console.error('⚠️ Firebase SDK did not load. Check that the firebase-app-compat.js, firebase-auth-compat.js, and firebase-firestore-compat.js <script> tags are ABOVE this file and loaded successfully (check the Network tab for 404s).');
} else {
  try{
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully.');
  }catch(err){
    console.error('⚠️ firebase.initializeApp() failed:', err);
  }
}

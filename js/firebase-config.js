<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDQ7GZ0-mB2xHScDKMjlDyRXLg6s9BqRXY",
    authDomain: "new-kdrama-quiz.firebaseapp.com",
    projectId: "new-kdrama-quiz",
    storageBucket: "new-kdrama-quiz.firebasestorage.app",
    messagingSenderId: "655215728523",
    appId: "1:655215728523:web:85e9eb644147bd8d45018e",
    measurementId: "G-WFY7NJV4YF"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

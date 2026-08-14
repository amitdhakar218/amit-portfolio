// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyArbOTneS1fFFlm8eVbqzta9hvc1mXJnj8",
  authDomain: "amit-portfolio-os.firebaseapp.com",
  projectId: "amit-portfolio-os",
  storageBucket: "amit-portfolio-os.firebasestorage.app",
  messagingSenderId: "674786216079",
  appId: "1:674786216079:web:e894d617c26b300eb708fa",
  measurementId: "G-758WH0H43S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// Storage
const storage = firebase.storage();

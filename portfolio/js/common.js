let profileData = null;

// Firebase config - Safe version (API key is semi-public for Web SDKs)
// Restrict this key in Firebase Console to prevent abuse
const firebaseConfig = {
  projectId: "amit-portfolio-79db4",
  databaseURL: "https://amit-portfolio-79db4-default-rtdb.firebaseio.com"
};

// Initialize only with projectId and databaseURL (no exposed API key in source)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// ... rest of common.js code

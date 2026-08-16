// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBg8Y3T_B25Kvg6IHKNemu6JMAXUFhfn-M",
  authDomain: "amit-portfolio-79db4.firebaseapp.com",
  databaseURL: "https://amit-portfolio-79db4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "amit-portfolio-79db4",
  storageBucket: "amit-portfolio-79db4.firebasestorage.app",
  messagingSenderId: "925822310763",
  appId: "1:925822310763:web:c59695e6aab94e9cca942e",
  measurementId: "G-D45ZKBTBEY"
};

// Initialize Firebase App & Database
if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = (typeof firebase !== "undefined") ? firebase.database() : null;

if (typeof firebase !== "undefined" && firebase.auth) {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      const isInPagesFolder = window.location.pathname.includes("/studio/pages/");
      window.location.href = isInPagesFolder ? "../login.html" : "login.html";
    } else {
      document.body.style.visibility = "visible";
    }
  });
} else {
  document.body.style.visibility = "visible";
}

// ==========================================
// 2. MAIN EVENT LISTENER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  setStudioDate();
  initLogout();
  
  // Load Stats from Firebase Realtime Database (Fallback to JSON)
  loadStatFromFirebase("projects", "../shared/data/projects.json", "stat-projects", "Project");
  loadStatFromFirebase("skills", "../shared/data/skills.json", "stat-skills", "Skill");
  loadStatFromFirebase("certificates", "../shared/data/certificates.json", "stat-certificates", "Certificate");
  loadStatFromFirebase("blog", "../shared/data/blog.json", "stat-blog", "Post");
});

function setStudioDate() {
  const el = document.getElementById("studio-date");
  if (!el) return;
  const today = new Date();
  el.textContent = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ==========================================
// 3. REALTIME DATABASE STATS LOADER
// ==========================================
async function loadStatFromFirebase(dbPath, jsonFallbackPath, elementId, label) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Try Firebase Database First
  if (db) {
    db.ref(dbPath).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const count = Array.isArray(val) ? val.filter(Boolean).length : Object.keys(val).length;
        el.textContent = `${count} ${label}${count === 1 ? "" : "s"}`;
      } else {
        // Fallback to local JSON if DB path is empty
        fetchJsonStat(jsonFallbackPath, el, label);
      }
    }, (error) => {
      console.warn(`Firebase read failed for ${dbPath}, using JSON fallback.`, error);
      fetchJsonStat(jsonFallbackPath, el, label);
    });
  } else {
    // If Firebase JS isn't loaded, fallback to JSON
    fetchJsonStat(jsonFallbackPath, el, label);
  }
}

async function fetchJsonStat(jsonPath, el, label) {
  try {
    const res = await fetch(jsonPath).catch(() => null);
    if (!res || !res.ok) throw new Error("not found");
    const data = await res.json();
    const count = Array.isArray(data) ? data.length : 0;
    el.textContent = `${count} ${label}${count === 1 ? "" : "s"}`;
  } catch (err) {
    el.textContent = `0 ${label}s`;
  }
}

// ==========================================
// 4. LOGOUT FUNCTIONALITY
// ==========================================
function initLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Logging out...";
    try {
      if (typeof firebase !== "undefined" && firebase.auth) await firebase.auth().signOut();
      sessionStorage.clear();
      localStorage.clear();
    } catch (err) {}
    const isInPagesFolder = window.location.pathname.includes("/studio/pages/");
    window.location.href = isInPagesFolder ? "../login.html" : "login.html";
  });
}

// ==========================================
// 5. FILE UPLOAD HELPER
// ==========================================
async function uploadFileToServer(file, statusEl, onSuccess) {
  if (!file) return;
  if (statusEl) statusEl.textContent = "Uploading...";

  try {
    // For Firebase direct client uploads or external URLs, you can handle reader/base64 or storage bucket.
    // Fallback simulation or direct success callback handling for static hosting
    const reader = new FileReader();
    reader.onload = function(e) {
      if (statusEl) statusEl.textContent = "✅ Ready!";
      onSuccess(e.target.result); // Base64 data URL for direct Realtime Database storage
    };
    reader.onerror = function() {
      if (statusEl) statusEl.textContent = "❌ Read failed.";
    };
    reader.readAsDataURL(file);
  } catch (err) {
    if (statusEl) statusEl.textContent = `❌ Upload failed: ${err.message}`;
  }
}

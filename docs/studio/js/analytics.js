// ==========================================
// ANALYTICS — Realtime Database only
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  loadVisitStats();
  loadClickStats();
  loadFeedbackList();
  loadVisitorsList();
});

function loadVisitStats() {
  onValue(ref(rtdb, "visits"), (snapshot) => {
    const val = snapshot.val();
    const count = val ? Object.keys(val).length : 0;
    setStatText("stat-visitors", `${count}`);
  }, () => setStatText("stat-visitors", "0"));
}

function loadClickStats() {
  onValue(ref(rtdb, "clicks"), (snapshot) => {
    const val = snapshot.val();
    const clicks = val ? Object.values(val) : [];
    setStatText("stat-clicks", `${clicks.length}`);
    setStatText("stat-github-clicks", `${clicks.filter(c => c.type === "github").length}`);
    setStatText("stat-linkedin-clicks", `${clicks.filter(c => c.type === "linkedin").length}`);
    setStatText("stat-resume-downloads", `${clicks.filter(c => c.type === "resume").length}`);
  }, () => {
    setStatText("stat-clicks", "0");
    setStatText("stat-github-clicks", "0");
    setStatText("stat-linkedin-clicks", "0");
    setStatText("stat-resume-downloads", "0");
  });
}

function setStatText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function loadFeedbackList() {
  const container = document.getElementById("feedback-list");
  if (!container) return;
  onValue(ref(rtdb, "feedback"), (snapshot) => {
    const val = snapshot.val();
    if (!val) { container.innerHTML = `<p class="text-muted">No feedback yet.</p>`; return; }
    const items = Object.values(val).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    container.innerHTML = items.map(item => `
      <div class="card" style="padding: var(--space-md);">
        <p style="font-weight:600;">${item.name || "Anonymous"}</p>
        <p class="card-body">${item.message || ""}</p>
        <p class="text-muted" style="font-size:0.75rem;">${new Date(item.timestamp).toLocaleString()}</p>
      </div>`).join("");
  }, () => { container.innerHTML = `<p class="text-muted">⚠️ Could not load feedback.</p>`; });
}

function loadVisitorsList() {
  const container = document.getElementById("visitors-list");
  if (!container) return;
  onValue(ref(rtdb, "visitors"), (snapshot) => {
    const val = snapshot.val();
    if (!val) { container.innerHTML = `<p class="text-muted">No visitor submissions yet.</p>`; return; }
    const items = Object.values(val).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    container.innerHTML = items.map(item => `
      <div class="card" style="padding: var(--space-md);">
        <p style="font-weight:600;">${item.name || "Visitor"}</p>
        <p class="text-muted" style="font-size:0.75rem;">${new Date(item.timestamp).toLocaleString()}</p>
      </div>`).join("");
  }, () => { container.innerHTML = `<p class="text-muted">⚠️ Could not load visitors.</p>`; });
}

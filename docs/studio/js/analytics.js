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

// Load Resume Downloads
function loadResumeDownloads() {
  if (typeof firebase === "undefined" || !firebase.database) return;

  firebase.database().ref("resume-downloads").once("value", snapshot => {
    const downloads = snapshot.val();
    const container = document.getElementById("resume-downloads-container");

    if (!downloads) {
      container.innerHTML = "<p class='text-muted'>No downloads yet</p>";
      return;
    }

    // Group by resume
    const grouped = {};
    Object.entries(downloads).forEach(([key, download]) => {
      const title = download.resumeTitle || "Unknown";
      if (!grouped[title]) grouped[title] = [];
      grouped[title].push(download);
    });

    const html = Object.entries(grouped).map(([title, items]) => `
      <div style="border-bottom: 1px solid var(--color-border); padding: var(--space-md) 0;">
        <h4 style="margin: 0 0 var(--space-sm) 0; color: var(--color-primary);">${title}</h4>
        <p class="text-muted" style="margin: 0 0 var(--space-sm) 0;">📥 Total Downloads: <strong>${items.length}</strong></p>
        <div style="font-size: 0.85em; max-height: 200px; overflow-y: auto;">
          ${items.map(item => `
            <div style="padding: var(--space-xs) 0; border-bottom: 1px solid var(--color-border-light);">
              <span style="color: var(--color-primary);">👤 ${item.name || 'Anonymous'}</span> 
              (<span class="text-muted">${item.email}</span>) 
              | 🌍 <strong>${item.country}</strong> 
              | 📅 ${new Date(item.timestamp).toLocaleDateString()}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    container.innerHTML = html;
  });
}

// Load Resume Views
function loadResumeViews() {
  if (typeof firebase === "undefined" || !firebase.database) return;

  firebase.database().ref("resume-views").once("value", snapshot => {
    const views = snapshot.val();
    const container = document.getElementById("resume-views-container");

    if (!views) {
      container.innerHTML = "<p class='text-muted'>No views yet</p>";
      return;
    }

    // Group by resume
    const grouped = {};
    Object.entries(views).forEach(([key, view]) => {
      const title = view.resumeTitle || "Unknown";
      if (!grouped[title]) grouped[title] = [];
      grouped[title].push(view);
    });

    const html = Object.entries(grouped).map(([title, items]) => `
      <div style="border-bottom: 1px solid var(--color-border); padding: var(--space-md) 0;">
        <h4 style="margin: 0 0 var(--space-sm) 0; color: var(--color-primary);">${title}</h4>
        <p class="text-muted" style="margin: 0 0 var(--space-sm) 0;">👁️ Total Views: <strong>${items.length}</strong></p>
        <div style="font-size: 0.85em; max-height: 200px; overflow-y: auto;">
          ${items.map(item => `
            <div style="padding: var(--space-xs) 0; border-bottom: 1px solid var(--color-border-light);">
              🌍 <strong>${item.country}</strong> 
              | 📍 ${item.city || 'Unknown'} 
              | IP: ${item.ip} 
              | 📅 ${new Date(item.timestamp).toLocaleDateString()}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    container.innerHTML = html;
  });
}

// Call on load
document.addEventListener("DOMContentLoaded", () => {
  loadResumeDownloads();
  loadResumeViews();
});

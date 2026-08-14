const API_BASE = "/api/data";

document.addEventListener("DOMContentLoaded", () => {
  loadVisitStats();
  loadClickStats();
  loadFeedbackList();
  loadVisitorsList();
});

async function loadVisitStats() {
  try {
    const res = await fetch(`${API_BASE}/visits.json`);
    if (!res.ok) throw new Error("not found");
    const visits = await res.json();
    setStatText("stat-visitors", `${visits.length}`);
  } catch (err) { console.warn("Visits not loaded:", err.message); }
}

async function loadClickStats() {
  try {
    const res = await fetch(`${API_BASE}/clicks.json`);
    if (!res.ok) throw new Error("not found");
    const clicks = await res.json();
    setStatText("stat-clicks", `${clicks.length}`);
    setStatText("stat-github-clicks", `${clicks.filter(c => c.type === "github").length}`);
    setStatText("stat-linkedin-clicks", `${clicks.filter(c => c.type === "linkedin").length}`);
    setStatText("stat-resume-downloads", `${clicks.filter(c => c.type === "resume").length}`);
  } catch (err) { console.warn("Clicks not loaded:", err.message); }
}

function setStatText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

async function loadFeedbackList() {
  const container = document.getElementById("feedback-list");
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/feedback.json`);
    if (!res.ok) throw new Error("not found");
    const list = await res.json();
    if (list.length === 0) { container.innerHTML = `<p class="text-muted">No feedback yet.</p>`; return; }
    container.innerHTML = list.map(item => `
      <div class="card" style="padding: var(--space-md);">
        <p style="font-weight:600;">${item.name}</p>
        <p class="card-body">${item.message}</p>
        <p class="text-muted" style="font-size:0.75rem;">${new Date(item.date).toLocaleString()}</p>
      </div>`).join("");
  } catch (err) { container.innerHTML = `<p class="text-muted">⚠️ Could not load feedback.</p>`; }
}

async function loadVisitorsList() {
  const container = document.getElementById("visitors-list");
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/visitors.json`);
    if (!res.ok) throw new Error("not found");
    const list = await res.json();
    if (list.length === 0) { container.innerHTML = `<p class="text-muted">No visitor submissions yet.</p>`; return; }
    container.innerHTML = list.map(item => `
      <div class="card" style="padding: var(--space-md);">
        <p style="font-weight:600;">${item.name} — ${item.email}</p>
        ${item.purpose ? `<p class="card-body">${item.purpose}</p>` : ""}
        <p class="text-muted" style="font-size:0.75rem;">${new Date(item.date).toLocaleString()}</p>
      </div>`).join("");
  } catch (err) { container.innerHTML = `<p class="text-muted">⚠️ Could not load visitors.</p>`; }
}
document.addEventListener("DOMContentLoaded", () => {
  setStudioDate();
  initLogout();
  loadStat("../shared/data/projects.json", "stat-projects", "Project");
  loadStat("../shared/data/skills.json", "stat-skills", "Skill");
  loadStat("../shared/data/certificates.json", "stat-certificates", "Certificate");
  loadStat("../shared/data/blog.json", "stat-blog", "Post");
});

function setStudioDate() {
  const el = document.getElementById("studio-date");
  if (!el) return;
  const today = new Date();
  el.textContent = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

async function loadStat(jsonPath, elementId, label) {
  const el = document.getElementById(elementId);
  if (!el) return;
  try {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    const count = Array.isArray(data) ? data.length : 0;
    el.textContent = `${count} ${label}${count === 1 ? "" : "s"}`;
  } catch (err) {
    el.textContent = `0 ${label}s`;
  }
}

function initLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Logging out...";
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch (err) {}
    const isInPagesFolder = window.location.pathname.includes("/studio/pages/");
    window.location.href = isInPagesFolder ? "../login.html" : "login.html";
  });
}

/* ---------- Reusable Upload Helper (used by gallery.js, videos.js, certificates.js, resume.js) ---------- */
async function uploadFileToServer(file, statusEl, onSuccess) {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);

  if (statusEl) statusEl.textContent = "Uploading...";

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    if (statusEl) statusEl.textContent = "✅ Uploaded!";
    onSuccess(data.path);
  } catch (err) {
    if (statusEl) statusEl.textContent = `❌ Upload failed: ${err.message}`;
  }
}
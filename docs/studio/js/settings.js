/* ==========================================================
   Amit Studio — Settings Module Script
   Depends on: Backend API — /api/data/site-settings.json
   ========================================================== */

const API_BASE = "/api/data";

const SECTION_LABELS = {
  about: "👤 About",
  projects: "💼 Projects",
  skills: "🧠 Skills",
  certificates: "🎓 Certificates",
  gallery: "🖼️ Gallery",
  videos: "🎬 Videos",
  blog: "📝 Blog"
};

let currentSections = {};

document.addEventListener("DOMContentLoaded", () => {
  loadSectionToggles();

  const form = document.getElementById("settings-form");
  if (form) form.addEventListener("submit", handleSettingsSubmit);

  const resetBtn = document.getElementById("settings-reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", handleStudioReload);
});

/* ---------- 1. Load and render toggles ---------- */
async function loadSectionToggles() {
  const container = document.getElementById("section-toggles");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/site-settings.json`);
    if (!res.ok) throw new Error("Failed to fetch site-settings.json");
    const data = await res.json();
    currentSections = data.sections || {};

    renderToggles();

  } catch (err) {
    console.warn("Site settings not loaded:", err.message);
    container.innerHTML = `<p class="text-muted">⚠️ Could not load section settings. Is the backend running?</p>`;
  }
}

function renderToggles() {
  const container = document.getElementById("section-toggles");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(SECTION_LABELS).forEach((key) => {
    const isOn = currentSections[key] !== false;
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.padding = "var(--space-sm) var(--space-md)";
    row.style.border = "1px solid var(--color-border)";
    row.style.borderRadius = "var(--radius-sm)";
    row.innerHTML = `
      <span>${SECTION_LABELS[key]}</span>
      <button type="button" class="btn ${isOn ? "btn-primary" : "btn-outline"}" data-key="${key}" data-toggle-btn>
        ${isOn ? "✅ Visible" : "🚫 Hidden"}
      </button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("[data-toggle-btn]").forEach((btn) => {
    btn.addEventListener("click", () => toggleSection(btn.dataset.key));
  });
}

/* ---------- 2. Toggle + save immediately ---------- */
async function toggleSection(key) {
  currentSections[key] = currentSections[key] === false ? true : false;
  renderToggles();

  try {
    const res = await fetch(`${API_BASE}/site-settings.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: currentSections })
    });
    if (!res.ok) throw new Error("Backend rejected the save");

    const statusEl = document.getElementById("settings-status");
    if (statusEl) statusEl.textContent = `✅ "${SECTION_LABELS[key]}" visibility updated permanently.`;

  } catch (err) {
    console.error("Failed to save section visibility:", err.message);
    const statusEl = document.getElementById("settings-status");
    if (statusEl) statusEl.textContent = "❌ Save failed. Is the backend running?";
  }
}

/* ---------- 3. Site Info Save (UI-only for now) ---------- */
function handleSettingsSubmit(e) {
  e.preventDefault();
  const settingsSnapshot = {
    siteTitle: document.getElementById("field-site-title").value,
    siteDescription: document.getElementById("field-site-description").value,
    favicon: document.getElementById("field-favicon").value
  };
  console.log("Settings ready to save (future phase will persist this):", settingsSnapshot);
  const statusEl = document.getElementById("settings-status");
  if (statusEl) statusEl.textContent = "✅ Settings captured (site title/meta persistence coming in a future step).";
}

/* ---------- 4. Reload Studio ---------- */
function handleStudioReload() {
  const confirmed = confirm("This will discard any unsaved form input and reload this page. Continue?");
  if (confirmed) window.location.reload();
}
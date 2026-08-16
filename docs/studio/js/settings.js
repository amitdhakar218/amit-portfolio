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

/* ---------- 1. Load and render toggles from Firebase ---------- */
function loadSectionToggles() {
  const container = document.getElementById("section-toggles");
  const statusEl = document.getElementById("settings-status");

  if (!container) return;

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  db.ref("siteSettings").on("value", (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      currentSections = data.sections || {};

      const titleInput = document.getElementById("field-site-title");
      const descInput = document.getElementById("field-site-description");
      const faviconInput = document.getElementById("field-favicon");

      if (titleInput && data.siteTitle) titleInput.value = data.siteTitle;
      if (descInput && data.siteDescription) descInput.value = data.siteDescription;
      if (faviconInput && data.favicon) faviconInput.value = data.favicon;
    } else {
      currentSections = {};
    }
    renderToggles();
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading settings: ${error.message}`;
  });
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

/* ---------- 2. Toggle + save immediately to Firebase ---------- */
async function toggleSection(key) {
  currentSections[key] = currentSections[key] === false ? true : false;
  renderToggles();

  const statusEl = document.getElementById("settings-status");

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref("siteSettings/sections").set(currentSections);

    if (statusEl) statusEl.textContent = `✅ "${SECTION_LABELS[key]}" visibility updated permanently in Firebase.`;

  } catch (err) {
    console.error("Failed to save section visibility:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

/* ---------- 3. Site Info Save to Firebase ---------- */
async function handleSettingsSubmit(e) {
  e.preventDefault();
  const settingsSnapshot = {
    siteTitle: document.getElementById("field-site-title").value.trim(),
    siteDescription: document.getElementById("field-site-description").value.trim(),
    favicon: document.getElementById("field-favicon").value.trim(),
    sections: currentSections
  };

  const statusEl = document.getElementById("settings-status");
  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref("siteSettings").set(settingsSnapshot);

    if (statusEl) statusEl.textContent = "✅ Site settings saved permanently to Firebase!";
  } catch (err) {
    console.error("Failed to save site settings:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

/* ---------- 4. Reload Studio ---------- */
function handleStudioReload() {
  const confirmed = confirm("This will discard any unsaved form input and reload this page. Continue?");
  if (confirmed) window.location.reload();
}

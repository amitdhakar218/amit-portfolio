const DEFAULT_THEME = {
  background: "#0d0d0d",
  surface: "#161616",
  primary: "#4f46e5",
  accent: "#22d3ee",
  text: "#f5f5f5",
  muted: "#9ca3af",
  border: "#2a2a2a",
  font: "'Segoe UI', system-ui, sans-serif"
};

const LIGHT_THEME = {
  background: "#f5f5f5",
  surface: "#ffffff",
  primary: "#4f46e5",
  accent: "#0891b2",
  text: "#0d0d0d",
  muted: "#4b5563",
  border: "#e2e2e2",
  font: "'Segoe UI', system-ui, sans-serif"
};

document.addEventListener("DOMContentLoaded", () => {
  const darkBtn = document.getElementById("theme-dark-btn");
  const lightBtn = document.getElementById("theme-light-btn");
  const primaryPicker = document.getElementById("field-color-primary");
  const accentPicker = document.getElementById("field-color-accent");
  const fontSelect = document.getElementById("field-font-primary");
  const saveBtn = document.getElementById("theme-save-btn");
  const resetBtn = document.getElementById("theme-reset-btn");

  loadSavedTheme();

  if (darkBtn) darkBtn.addEventListener("click", () => applyThemePreset(DEFAULT_THEME, darkBtn, lightBtn));
  if (lightBtn) lightBtn.addEventListener("click", () => applyThemePreset(LIGHT_THEME, lightBtn, darkBtn));

  if (primaryPicker) primaryPicker.addEventListener("input", (e) => setCssVar("--color-primary", e.target.value));
  if (accentPicker) accentPicker.addEventListener("input", (e) => setCssVar("--color-accent", e.target.value));
  if (fontSelect) fontSelect.addEventListener("change", (e) => setCssVar("--font-primary", e.target.value));

  if (saveBtn) saveBtn.addEventListener("click", handleThemeSave);
  if (resetBtn) resetBtn.addEventListener("click", () => {
    applyThemePreset(DEFAULT_THEME, darkBtn, lightBtn);
    if (primaryPicker) primaryPicker.value = DEFAULT_THEME.primary;
    if (accentPicker) accentPicker.value = DEFAULT_THEME.accent;
    if (fontSelect) fontSelect.value = DEFAULT_THEME.font;

    const statusEl = document.getElementById("theme-status");
    if (statusEl) statusEl.textContent = "↺ Reset to default (click Save Theme to persist this).";
  });
});

/* ---------- 1. Load saved theme from Firebase Realtime Database ---------- */
function loadSavedTheme() {
  const statusEl = document.getElementById("theme-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading theme from Firebase...";

  db.ref("themeTokens").on("value", (snapshot) => {
    if (snapshot.exists()) {
      const tokens = snapshot.val();

      if (tokens.colors) {
        setCssVar("--color-background", tokens.colors.background);
        setCssVar("--color-surface", tokens.colors.surface);
        setCssVar("--color-primary", tokens.colors.primary);
        setCssVar("--color-accent", tokens.colors.accent);
        setCssVar("--color-text", tokens.colors.text);
        setCssVar("--color-muted", tokens.colors.muted);
        setCssVar("--color-border", tokens.colors.border);
      }

      if (tokens.fonts) {
        setCssVar("--font-primary", tokens.fonts.primary);
      }

      const primaryPicker = document.getElementById("field-color-primary");
      const accentPicker = document.getElementById("field-color-accent");
      const fontSelect = document.getElementById("field-font-primary");
      if (primaryPicker && tokens.colors?.primary) primaryPicker.value = tokens.colors.primary;
      if (accentPicker && tokens.colors?.accent) accentPicker.value = tokens.colors.accent;
      if (fontSelect && tokens.fonts?.primary) fontSelect.value = tokens.fonts.primary;

      if (statusEl) statusEl.textContent = "Saved theme loaded from Firebase ✅";
    } else {
      if (statusEl) statusEl.textContent = "Using default theme (no custom theme in Firebase yet).";
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading theme: ${error.message}`;
  });
}

/* ---------- 2. Apply a full theme preset (live preview only) ---------- */
function applyThemePreset(theme, activeBtn, inactiveBtn) {
  setCssVar("--color-background", theme.background);
  setCssVar("--color-surface", theme.surface);
  setCssVar("--color-primary", theme.primary);
  setCssVar("--color-accent", theme.accent);
  setCssVar("--color-text", theme.text);
  setCssVar("--color-muted", theme.muted);
  setCssVar("--color-border", theme.border);
  setCssVar("--font-primary", theme.font);

  if (activeBtn) {
    activeBtn.classList.remove("btn-outline");
    activeBtn.classList.add("btn-primary");
  }
  if (inactiveBtn) {
    inactiveBtn.classList.remove("btn-primary");
    inactiveBtn.classList.add("btn-outline");
  }
}

/* ---------- 3. Helper: Set a CSS custom property on :root ---------- */
function setCssVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

/* ---------- 4. Save Theme directly to Firebase ---------- */
async function handleThemeSave() {
  const statusEl = document.getElementById("theme-status");

  const computed = getComputedStyle(document.documentElement);
  const updatedTokens = {
    colors: {
      background: computed.getPropertyValue("--color-background").trim(),
      surface: computed.getPropertyValue("--color-surface").trim(),
      primary: computed.getPropertyValue("--color-primary").trim(),
      accent: computed.getPropertyValue("--color-accent").trim(),
      text: computed.getPropertyValue("--color-text").trim(),
      muted: computed.getPropertyValue("--color-muted").trim(),
      border: computed.getPropertyValue("--color-border").trim()
    },
    fonts: {
      primary: computed.getPropertyValue("--font-primary").trim(),
      mono: "'Fira Code', monospace"
    },
    spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "40px" },
    radius: { sm: "6px", md: "12px", lg: "20px" }
  };

  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref("themeTokens").set(updatedTokens);

    if (statusEl) statusEl.textContent = "✅ Theme saved permanently to Firebase!";
  } catch (err) {
    console.error("Failed to save theme:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

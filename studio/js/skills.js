/* ==========================================================
   Amit Studio — Skills Module Script
   Depends on: Backend API (api/server.js) — /api/data/skills.json
   Now connected to real backend: Add/Edit/Delete/Reorder
   permanently update shared/data/skills.json.
   ========================================================== */

const API_BASE = "/api/data";
let editingSkillId = null;
let currentSkillsList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSkillsList();

  const form = document.getElementById("skill-form");
  if (form) form.addEventListener("submit", handleSkillSubmit);

  const cancelBtn = document.getElementById("skill-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetSkillForm);
});

/* ---------- 1. Load skills.json from backend ---------- */
async function loadSkillsList() {
  const statusEl = document.getElementById("skills-status");

  try {
    const res = await fetch(`${API_BASE}/skills.json`);
    if (!res.ok) throw new Error("Failed to fetch skills.json from backend");
    currentSkillsList = await res.json();

    if (statusEl) statusEl.textContent = `${currentSkillsList.length} skill(s) loaded from server ✅`;
    renderSkillsList();

  } catch (err) {
    console.warn("Skills data not loaded:", err.message);
    if (statusEl) statusEl.textContent = "⚠️ Could not load skills. Is the backend running?";
  }
}

/* ---------- 2. Render Skills List ---------- */
function renderSkillsList() {
  const list = document.getElementById("studio-skills-list");
  if (!list) return;

  list.innerHTML = "";

  if (currentSkillsList.length === 0) {
    list.innerHTML = `<p class="text-muted">No skills yet. Add one above.</p>`;
    return;
  }

  currentSkillsList.forEach((skill, index) => {
    const item = document.createElement("div");
    item.className = "skill-item";
    item.innerHTML = `
      <div class="skill-header">
        <span>${skill.name}</span>
        <span class="text-muted">${skill.percentage}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${skill.percentage}%;"></div>
      </div>
      <div class="project-links" style="margin-top: var(--space-sm);">
        <button class="btn btn-icon" data-action="up" data-id="${skill.id}" ${index === 0 ? "disabled" : ""}>⬆️ Up</button>
        <button class="btn btn-icon" data-action="down" data-id="${skill.id}" ${index === currentSkillsList.length - 1 ? "disabled" : ""}>⬇️ Down</button>
        <button class="btn btn-icon" data-action="edit" data-id="${skill.id}">✏️ Edit</button>
        <button class="btn btn-icon" data-action="delete" data-id="${skill.id}">🗑️ Delete</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('[data-action="edit"]').forEach(btn =>
    btn.addEventListener("click", () => startEditSkill(btn.dataset.id))
  );
  list.querySelectorAll('[data-action="delete"]').forEach(btn =>
    btn.addEventListener("click", () => deleteSkill(btn.dataset.id))
  );
  list.querySelectorAll('[data-action="up"]').forEach(btn =>
    btn.addEventListener("click", () => moveSkill(btn.dataset.id, -1))
  );
  list.querySelectorAll('[data-action="down"]').forEach(btn =>
    btn.addEventListener("click", () => moveSkill(btn.dataset.id, 1))
  );
}

/* ---------- 3. Add / Update Skill on Submit (real backend calls) ---------- */
async function handleSkillSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("field-skill-name").value.trim();
  const percentage = parseInt(document.getElementById("field-skill-percentage").value, 10);
  if (!name || isNaN(percentage)) return;

  const statusEl = document.getElementById("skills-status");
  if (statusEl) statusEl.textContent = "Saving...";

  try {
    if (editingSkillId) {
      const res = await fetch(`${API_BASE}/skills.json/item/${editingSkillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, percentage })
      });
      if (!res.ok) throw new Error("Backend rejected the update");
      if (statusEl) statusEl.textContent = "✅ Skill updated permanently.";
    } else {
      const res = await fetch(`${API_BASE}/skills.json/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, percentage })
      });
      if (!res.ok) throw new Error("Backend rejected the add request");
      if (statusEl) statusEl.textContent = "✅ Skill added permanently.";
    }

    resetSkillForm();
    loadSkillsList();

  } catch (err) {
    console.error("Failed to save skill:", err.message);
    if (statusEl) statusEl.textContent = "❌ Save failed. Is the backend running?";
  }
}

/* ---------- 4. Start Editing a Skill ---------- */
function startEditSkill(id) {
  const skill = currentSkillsList.find(s => s.id === id);
  if (!skill) return;

  editingSkillId = id;

  document.getElementById("field-skill-id").value = id;
  document.getElementById("field-skill-name").value = skill.name || "";
  document.getElementById("field-skill-percentage").value = skill.percentage || 0;

  document.getElementById("skill-form-title").textContent = "Edit Skill";
  document.getElementById("skill-submit-btn").textContent = "💾 Update Skill";
  document.getElementById("skill-cancel-btn").style.display = "inline-flex";

  document.getElementById("skill-form").scrollIntoView({ behavior: "smooth" });
}

/* ---------- 5. Delete a Skill (real backend call) ---------- */
async function deleteSkill(id) {
  const statusEl = document.getElementById("skills-status");
  if (statusEl) statusEl.textContent = "Deleting...";

  try {
    const res = await fetch(`${API_BASE}/skills.json/item/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Backend rejected the delete request");

    if (statusEl) statusEl.textContent = "🗑️ Skill removed permanently.";
    if (editingSkillId === id) resetSkillForm();
    loadSkillsList();

  } catch (err) {
    console.error("Failed to delete skill:", err.message);
    if (statusEl) statusEl.textContent = "❌ Delete failed. Is the backend running?";
  }
}

/* ---------- 6. Reorder a Skill (whole-array PUT save) ---------- */
async function moveSkill(id, direction) {
  const index = currentSkillsList.findIndex(s => s.id === id);
  if (index === -1) return;

  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= currentSkillsList.length) return;

  [currentSkillsList[index], currentSkillsList[newIndex]] = [currentSkillsList[newIndex], currentSkillsList[index]];
  renderSkillsList();

  const statusEl = document.getElementById("skills-status");
  if (statusEl) statusEl.textContent = "Saving new order...";

  try {
    const res = await fetch(`${API_BASE}/skills.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentSkillsList)
    });
    if (!res.ok) throw new Error("Backend rejected the reorder save");

    if (statusEl) statusEl.textContent = "↕️ Order saved permanently.";

  } catch (err) {
    console.error("Failed to save new order:", err.message);
    if (statusEl) statusEl.textContent = "❌ Reorder save failed. Is the backend running?";
  }
}

/* ---------- 7. Reset Form to "Add" Mode ---------- */
function resetSkillForm() {
  editingSkillId = null;
  document.getElementById("skill-form").reset();
  document.getElementById("field-skill-id").value = "";
  document.getElementById("skill-form-title").textContent = "Add New Skill";
  document.getElementById("skill-submit-btn").textContent = "+ Add Skill";
  document.getElementById("skill-cancel-btn").style.display = "none";
}
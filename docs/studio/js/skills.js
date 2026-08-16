let editingSkillId = null;
let currentSkillsList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSkillsList();

  const form = document.getElementById("skill-form");
  if (form) form.addEventListener("submit", handleSkillSubmit);

  const cancelBtn = document.getElementById("skill-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetSkillForm);
});

/* ---------- Helper: Convert Firebase Object to Array ---------- */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((item, idx) => item ? { id: item.id || idx.toString(), ...item } : null).filter(Boolean);
  return Object.keys(val).map(key => ({ id: key, ...val[key] }));
}

/* ---------- 1. Load skills from Firebase Realtime Database ---------- */
function loadSkillsList() {
  const statusEl = document.getElementById("skills-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading skills from Firebase...";

  db.ref("skills").on("value", (snapshot) => {
    if (snapshot.exists()) {
      currentSkillsList = toArray(snapshot.val());
      if (statusEl) statusEl.textContent = `${currentSkillsList.length} skill(s) loaded from Firebase ✅`;
      renderSkillsList();
    } else {
      currentSkillsList = [];
      if (statusEl) statusEl.textContent = "0 skills found in database.";
      renderSkillsList();
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading skills: ${error.message}`;
  });
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

/* ---------- 3. Add / Update Skill on Submit (Firebase) ---------- */
async function handleSkillSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("field-skill-name").value.trim();
  const percentage = parseInt(document.getElementById("field-skill-percentage").value, 10);
  if (!name || isNaN(percentage)) return;

  const skillData = { name, percentage };
  const statusEl = document.getElementById("skills-status");

  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    if (editingSkillId) {
      await db.ref(`skills/${editingSkillId}`).update(skillData);
      if (statusEl) statusEl.textContent = "✅ Skill updated in Firebase!";
    } else {
      const newRef = db.ref("skills").push();
      await newRef.set({ ...skillData, id: newRef.key });
      if (statusEl) statusEl.textContent = "✅ Skill added to Firebase!";
    }

    resetSkillForm();

  } catch (err) {
    console.error("Failed to save skill:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
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

/* ---------- 5. Delete a Skill (Firebase) ---------- */
async function deleteSkill(id) {
  const statusEl = document.getElementById("skills-status");
  if (statusEl) statusEl.textContent = "Deleting from Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref(`skills/${id}`).remove();

    if (statusEl) statusEl.textContent = "🗑️ Skill removed from Firebase!";
    if (editingSkillId === id) resetSkillForm();

  } catch (err) {
    console.error("Failed to delete skill:", err.message);
    if (statusEl) statusEl.textContent = `❌ Delete failed: ${err.message}`;
  }
}

/* ---------- 6. Reorder Skills in Firebase ---------- */
async function moveSkill(id, direction) {
  const index = currentSkillsList.findIndex(s => s.id === id);
  if (index === -1) return;

  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= currentSkillsList.length) return;

  [currentSkillsList[index], currentSkillsList[newIndex]] = [currentSkillsList[newIndex], currentSkillsList[index]];

  const statusEl = document.getElementById("skills-status");
  if (statusEl) statusEl.textContent = "Saving new order to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref("skills").set(currentSkillsList);
    if (statusEl) statusEl.textContent = "↕️ Order saved permanently to Firebase!";
  } catch (err) {
    console.error("Failed to save new order:", err.message);
    if (statusEl) statusEl.textContent = `❌ Reorder save failed: ${err.message}`;
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

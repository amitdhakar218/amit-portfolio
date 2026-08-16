let editingProjectId = null;
let currentProjectsList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProjectsList();

  const form = document.getElementById("project-form");
  if (form) form.addEventListener("submit", handleProjectSubmit);

  const cancelBtn = document.getElementById("project-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetProjectForm);
});

/* ---------- Helper: Convert Firebase Object to Array ---------- */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((item, idx) => item ? { id: item.id || idx.toString(), ...item } : null).filter(Boolean);
  return Object.keys(val).map(key => ({ id: key, ...val[key] }));
}

/* ---------- 1. Load projects from Firebase Realtime Database ---------- */
function loadProjectsList() {
  const statusEl = document.getElementById("projects-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading projects from Firebase...";

  db.ref("projects").on("value", (snapshot) => {
    if (snapshot.exists()) {
      currentProjectsList = toArray(snapshot.val());
      if (statusEl) statusEl.textContent = `${currentProjectsList.length} project(s) loaded from Firebase ✅`;
      renderProjectsList(currentProjectsList);
    } else {
      currentProjectsList = [];
      if (statusEl) statusEl.textContent = "0 projects found in database.";
      renderProjectsList([]);
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading projects: ${error.message}`;
  });
}

/* ---------- 2. Render Projects List ---------- */
function renderProjectsList(projectsList) {
  const grid = document.getElementById("studio-projects-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (projectsList.length === 0) {
    grid.innerHTML = `<p class="text-muted">No projects yet. Add one above.</p>`;
    return;
  }

  projectsList.forEach((project) => {
    const card = document.createElement("div");
    card.className = "card project-card";
    const imgSrc = project.screenshot?.startsWith("http") ? project.screenshot : `../../portfolio/${project.screenshot || 'assets/project-placeholder.png'}`;
    card.innerHTML = `
      <img src="${imgSrc}" alt="${project.name}" class="project-image radius-md" />
      <h3 class="card-title">${project.name}</h3>
      <p class="card-body">${project.description || ""}</p>
      <div class="project-tags">
        ${(project.tech || []).map(tag => `<span class="badge-outline badge">${tag}</span>`).join("")}
      </div>
      <div class="project-links">
        <button class="btn btn-icon" data-action="edit" data-id="${project.id}">✏️ Edit</button>
        <button class="btn btn-icon" data-action="delete" data-id="${project.id}">🗑️ Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-action="edit"]').forEach(btn =>
    btn.addEventListener("click", () => startEditProject(btn.dataset.id, projectsList))
  );
  grid.querySelectorAll('[data-action="delete"]').forEach(btn =>
    btn.addEventListener("click", () => deleteProject(btn.dataset.id))
  );
}

/* ---------- 3. Add / Update Project on Submit (Firebase) ---------- */
async function handleProjectSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("field-project-name").value.trim();
  if (!name) return;

  const techRaw = document.getElementById("field-project-tech").value;
  const tech = techRaw ? techRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  const projectData = {
    name,
    description: document.getElementById("field-project-description").value || "",
    screenshot: document.getElementById("field-project-screenshot").value || "assets/project-placeholder.png",
    tech,
    github: document.getElementById("field-project-github").value || "",
    demo: document.getElementById("field-project-demo").value || "",
    video: document.getElementById("field-project-video").value || "",
    futureUpdate: document.getElementById("field-project-future").value === "true"
  };

  const statusEl = document.getElementById("projects-status");
  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    if (editingProjectId) {
      await db.ref(`projects/${editingProjectId}`).update(projectData);
      if (statusEl) statusEl.textContent = "✅ Project updated in Firebase!";
    } else {
      const newRef = db.ref("projects").push();
      await newRef.set({ ...projectData, id: newRef.key });
      if (statusEl) statusEl.textContent = "✅ Project added to Firebase!";
    }

    resetProjectForm();

  } catch (err) {
    console.error("Failed to save project:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

/* ---------- 4. Start Editing a Project ---------- */
function startEditProject(id, projectsList) {
  const project = projectsList.find(p => p.id === id);
  if (!project) return;

  editingProjectId = id;

  document.getElementById("field-project-id").value = id;
  document.getElementById("field-project-name").value = project.name || "";
  document.getElementById("field-project-tech").value = (project.tech || []).join(", ");
  document.getElementById("field-project-description").value = project.description || "";
  document.getElementById("field-project-screenshot").value = project.screenshot || "";
  document.getElementById("field-project-github").value = project.github || "";
  document.getElementById("field-project-demo").value = project.demo || "";
  document.getElementById("field-project-video").value = project.video || "";
  document.getElementById("field-project-future").value = project.futureUpdate ? "true" : "false";

  document.getElementById("project-form-title").textContent = "Edit Project";
  document.getElementById("project-submit-btn").textContent = "💾 Update Project";
  document.getElementById("project-cancel-btn").style.display = "inline-flex";

  document.getElementById("project-form").scrollIntoView({ behavior: "smooth" });
}

/* ---------- 5. Delete a Project (Firebase) ---------- */
async function deleteProject(id) {
  const statusEl = document.getElementById("projects-status");
  if (statusEl) statusEl.textContent = "Deleting from Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref(`projects/${id}`).remove();

    if (statusEl) statusEl.textContent = "🗑️ Project removed from Firebase!";
    if (editingProjectId === id) resetProjectForm();

  } catch (err) {
    console.error("Failed to delete project:", err.message);
    if (statusEl) statusEl.textContent = `❌ Delete failed: ${err.message}`;
  }
}

/* ---------- 6. Reset Form to "Add" Mode ---------- */
function resetProjectForm() {
  editingProjectId = null;
  document.getElementById("project-form").reset();
  document.getElementById("field-project-id").value = "";
  document.getElementById("project-form-title").textContent = "Add New Project";
  document.getElementById("project-submit-btn").textContent = "+ Add Project";
  document.getElementById("project-cancel-btn").style.display = "none";
}

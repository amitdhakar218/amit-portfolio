/* ==========================================================
   Amit Studio — Projects Module Script
   Depends on: Backend API (api/server.js) — /api/data/projects.json
   Now connected to real backend: Add/Edit/Delete permanently
   update shared/data/projects.json via POST/PUT/DELETE.
   ========================================================== */

const API_BASE = "/api/data";
let editingProjectId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadProjectsList();

  const form = document.getElementById("project-form");
  if (form) form.addEventListener("submit", handleProjectSubmit);

  const cancelBtn = document.getElementById("project-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetProjectForm);
});

/* ---------- 1. Load projects.json from backend ---------- */
async function loadProjectsList() {
  const statusEl = document.getElementById("projects-status");

  try {
    const res = await fetch(`${API_BASE}/projects.json`);
    if (!res.ok) throw new Error("Failed to fetch projects.json from backend");
    const projectsList = await res.json();

    if (statusEl) statusEl.textContent = `${projectsList.length} project(s) loaded from server ✅`;
    renderProjectsList(projectsList);

  } catch (err) {
    console.warn("Projects data not loaded:", err.message);
    if (statusEl) statusEl.textContent = "⚠️ Could not load projects. Is the backend running?";
  }
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
    card.innerHTML = `
      <img src="../../portfolio/${project.screenshot || 'assets/project-placeholder.png'}" alt="${project.name}" class="project-image radius-md" />
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

/* ---------- 3. Add / Update Project on Submit (real backend calls) ---------- */
async function handleProjectSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("field-project-name").value.trim();
  if (!name) return;

  const techRaw = document.getElementById("field-project-tech").value;
  const tech = techRaw ? techRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  const projectData = {
    name,
    description: document.getElementById("field-project-description").value,
    screenshot: document.getElementById("field-project-screenshot").value || "assets/project-placeholder.png",
    tech,
    github: document.getElementById("field-project-github").value,
    demo: document.getElementById("field-project-demo").value,
    video: document.getElementById("field-project-video").value,
    futureUpdate: document.getElementById("field-project-future").value === "true"
  };

  const statusEl = document.getElementById("projects-status");
  if (statusEl) statusEl.textContent = "Saving...";

  try {
    if (editingProjectId) {
      const res = await fetch(`${API_BASE}/projects.json/item/${editingProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });
      if (!res.ok) throw new Error("Backend rejected the update");
      console.log("Project updated permanently:", await res.json());
      if (statusEl) statusEl.textContent = "✅ Project updated permanently.";
    } else {
      const res = await fetch(`${API_BASE}/projects.json/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });
      if (!res.ok) throw new Error("Backend rejected the add request");
      console.log("Project added permanently:", await res.json());
      if (statusEl) statusEl.textContent = "✅ Project added permanently.";
    }

    resetProjectForm();
    loadProjectsList();

  } catch (err) {
    console.error("Failed to save project:", err.message);
    if (statusEl) statusEl.textContent = "❌ Save failed. Is the backend running?";
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

/* ---------- 5. Delete a Project (real backend call) ---------- */
async function deleteProject(id) {
  const statusEl = document.getElementById("projects-status");
  if (statusEl) statusEl.textContent = "Deleting...";

  try {
    const res = await fetch(`${API_BASE}/projects.json/item/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Backend rejected the delete request");

    console.log("Project deleted permanently:", id);
    if (statusEl) statusEl.textContent = "🗑️ Project removed permanently.";

    if (editingProjectId === id) resetProjectForm();
    loadProjectsList();

  } catch (err) {
    console.error("Failed to delete project:", err.message);
    if (statusEl) statusEl.textContent = "❌ Delete failed. Is the backend running?";
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